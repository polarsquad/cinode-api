import dotenv from 'dotenv';
dotenv.config();

const requiredEnv = (key) => {
  const value = process.env[key];
  if (!value || value === '') {
    throw new Error(`${key} environment variable is required`);
  }
  return value;
};

export const cinodeConfig = {
  companyId: requiredEnv('CINODE_COMPANY_ID'),
  companyName: requiredEnv('CINODE_COMPANY_NAME'),
  accessId: requiredEnv('CINODE_ACCESS_ID'),
  accessSecret: requiredEnv('CINODE_ACCESS_SECRET'),
};
