import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useConvertAnonymousUser = () => {
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const convertToRegistered = async (email: string, password: string, fullName?: string) => {
    setIsConverting(true);

    try {
      // Obter usuário atual (anônimo)
      const { data: { user: currentUser }, error: getUserError } = await supabase.auth.getUser();

      if (getUserError || !currentUser) {
        throw new Error('Usuário não autenticado');
      }

      if (!currentUser.is_anonymous) {
        throw new Error('Usuário já possui conta registrada');
      }

      // Atualizar para conta permanente
      const { data: { user }, error: updateError } = await supabase.auth.updateUser({
        email,
        password,
        data: {
          full_name: fullName,
        },
      });

      if (updateError) {
        throw updateError;
      }

      // Atualizar perfil no banco
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user!.id,
          email,
          full_name: fullName,
        });

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }

      // Atualizar customer
      const { error: customerError } = await supabase
        .from('customers')
        .update({
          email,
          name: fullName,
        })
        .eq('user_id', user!.id);

      if (customerError) {
        console.error('Error updating customer:', customerError);
      }

      // Registrar no audit log
      await supabase.from('audit_logs').insert({
        actor: user!.id,
        action: 'anonymous_user_converted',
        entity: 'auth',
        entity_id: user!.id,
        diff: {
          email,
          converted_at: new Date().toISOString(),
        },
      });

      toast({
        title: "Conta criada com sucesso!",
        description: "Sua conta foi convertida. Faça login com suas credenciais.",
      });

      // Fazer logout para que o usuário faça login novamente
      await supabase.auth.signOut();

      return { success: true, user };

    } catch (error) {
      console.error('Error converting anonymous user:', error);
      toast({
        title: "Erro ao criar conta",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsConverting(false);
    }
  };

  return {
    convertToRegistered,
    isConverting,
  };
};
