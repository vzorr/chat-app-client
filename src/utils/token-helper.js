import jwtEncode from 'jwt-encode';

const SECRET_KEY = 'your_super_secret_key';

export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
  };

  return jwtEncode(payload, SECRET_KEY);
};

export const USERS = [
  {
    id: "7e2d6b1a-1bc3-462a-7cbd-8cae450d1d64",
    name: "majid",
    email: "majid@aibsol.com",
    phone: "+1234567890",
  },
  {
    id: "7e2d6b1a-1bc3-462a-7cbd-8cae450d1d63",
    name: "cynosureksa",
    email: "cynosureksa@gmail.com",
    phone: "+1234567891",
  }
].map(user => ({
  ...user,
  token: generateToken(user)
}));
