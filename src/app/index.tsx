import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';

import HomeScreen from '@/features/home/screens/HomeScreen';
import { hasActiveSession } from '@/features/auth/api/authService';

// app/ es una capa de ruteo delgada — sin lógica de negocio acá.
//
// Gate mínimo de B1: sin sesión → /welcome (intro breve, ver WelcomeScreen),
// con sesión → el único Home que existe hoy. El routing por rol (B3)
// construye sobre esto — acá no se agrega infraestructura de roles.
export default function Index() {
  const [status, setStatus] = useState<'loading' | 'authed' | 'guest'>('loading');

  useEffect(() => {
    let mounted = true;

    hasActiveSession().then((active) => {
      if (mounted) setStatus(active ? 'authed' : 'guest');
    });

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

  return <HomeScreen />;
}
