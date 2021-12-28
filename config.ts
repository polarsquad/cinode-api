import dotenv from 'dotenv';
dotenv.config();

const requiredEnv = (key) => {
  const value = process.env[key];
  if (!value || value === '') {
    throw new Error(`${key} environment variable is required`);
  }
  return value;
};

export const cinode = {
  companyId: requiredEnv('CINODE_COMPANY_ID'),
  companyName: requiredEnv('CINODE_COMPANY_NAME'),
  appId: requiredEnv('CINODE_APP_ID'),
  appSecret: requiredEnv('CINODE_APP_SECRET'),
};
