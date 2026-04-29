import * as Yup from 'yup';

// portfolio_schema


export const register_schema = Yup.object().shape({
  name: Yup.string().required().label("Name"),
  lastname: Yup.string().required().label("LastName"),
  username: Yup.string().required().label("UserName"),
  email: Yup.string().required().email().label("Email"),
  password: Yup.string().required().min(6).label("Password"),
});
export const contact_schema = Yup.object().shape({
  name: Yup.string().required().label("Name"),
  email: Yup.string().required().email().label("Email"),
  phone: Yup.string().required().label("Phone"),
  message: Yup.string().required().label("Message"),
 
});

export const login_schema = Yup.object().shape({
  email: Yup.string().required().email().label("Email"),
  password: Yup.string().required().min(6).label("Password"),
  // Eliminamos la línea de username
});

