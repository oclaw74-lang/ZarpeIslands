import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';

import HomeScreen from '@/features/home/screens/HomeScreen';
import { hasActiveSession } from '@/features/auth/api/authService';
import { getCompanyMembership } from '@/features/company/api/companyService';

type Status = 'loading' | 'guest' | 'needs-onboarding' | 'authed';

// app/ es una capa de ruteo delgada — sin lógica de negocio acá.
//
// Gate de B1/B2: sin sesión → /welcome (intro breve, ver WelcomeScreen); con
// sesión pero sin fila en company_members → /onboarding (bootstrap de
// empresa, ver B2); con sesión y empresa → el único Home que existe hoy. El
// routing por rol (B3) construye sobre esto — acá no se agrega
// infraestructura de roles.
export default function Index() {
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let mounted = true;

    async function check() {
      const active = await hasActiveSession();
      if (!active) {
        if (mounted) setStatus('guest');
        return;
      }

      const membership = await getCompanyMembership();
      if (!mounted) return;

      setStatus(membership === undefined ? 'needs-onboarding' : 'authed');
    }

    check();
    return () => {
      mounted = false;
    };
  }, []);

  if (status === 'loading') {
    return null;
  }

  if (status === 'guest') {
    return <Redirect href="/welcome" />;
  }

  if (status === 'needs-onboarding') {
    return <Redirect href="/onboarding" />;
  }

  return <HomeScreen />;
}
