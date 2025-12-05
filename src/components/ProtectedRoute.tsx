import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  const [mfaChecked, setMfaChecked] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaVerified, setMfaVerified] = useState(false);
  const [checkingMfa, setCheckingMfa] = useState(true);

  useEffect(() => {
    const checkAdminMfa = async () => {
      if (!user || !isAdmin) {
        setCheckingMfa(false);
        setMfaChecked(true);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_mfa")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (!error && data) {
          setMfaEnabled(true);
          
          // Check if 2FA has been verified in this session
          const verified = sessionStorage.getItem(`2fa_verified_${user.id}`);
          if (verified) {
            setMfaVerified(true);
            
            // Send admin access notification (only once per session)
            const sessionNotified = sessionStorage.getItem(`admin_access_notified_${user.id}`);
            if (!sessionNotified) {
              try {
                await supabase.functions.invoke('send-security-notification', {
                  body: {
                    event_type: 'admin_access',
                    metadata: {
                      userAgent: navigator.userAgent,
                    }
                  }
                });
                sessionStorage.setItem(`admin_access_notified_${user.id}`, 'true');
              } catch (e) {
                console.error("Failed to send admin access notification:", e);
              }
            }
          }
        }
        setMfaChecked(true);
      } catch (error) {
        console.error("Error checking MFA status:", error);
        setMfaChecked(true);
      } finally {
        setCheckingMfa(false);
      }
    };

    if (!loading && user) {
      checkAdminMfa();
    } else if (!loading) {
      setCheckingMfa(false);
      setMfaChecked(true);
    }
  }, [user, isAdmin, loading]);

  if (loading || checkingMfa) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  // Force 2FA setup for admins if not enabled (except when already on security page)
  if (isAdmin && mfaChecked && !mfaEnabled && location.pathname !== "/conta/seguranca") {
    return <Navigate to="/conta/seguranca" state={{ forceSetup: true, from: location.pathname }} />;
  }

  // Force 2FA verification if enabled but not verified in this session
  if (isAdmin && mfaChecked && mfaEnabled && !mfaVerified) {
    return <Navigate to="/verify-2fa" state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};
