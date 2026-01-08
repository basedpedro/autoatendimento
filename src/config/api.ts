

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://192.168.123.68:2081',

  username: import.meta.env.VITE_API_USER || 'VISAODIGITAL',
  password: import.meta.env.VITE_API_PASSWORD || 'VI@DIGI2023',
  

  clientId: import.meta.env.VITE_CLIENT_ID || '1',
  clientCnpjCpf: import.meta.env.VITE_CLIENT_CNPJCPF || '97.196.356/0001-84',
  clientToken: import.meta.env.VITE_CLIENT_TOKEN || 'A80125FE35F0DB31D815A8E68E6738028D28EF64',
  

  timeout: 30000,
};

export const getBasicAuthHeader = (): string => {
  const credentials = `${API_CONFIG.username}:${API_CONFIG.password}`;
  return `Basic ${btoa(credentials)}`;
};

export const getDefaultHeaders = (): HeadersInit => {
  return {
    'Authorization': getBasicAuthHeader(),
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'cli-id': API_CONFIG.clientId,
    'cli-cnpjcpf': API_CONFIG.clientCnpjCpf,
    'cli-token': API_CONFIG.clientToken,
  };
};
