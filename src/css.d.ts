// Declaraciones de tipos para imports de CSS (soporte web de react-native-web/Expo).
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.css';
