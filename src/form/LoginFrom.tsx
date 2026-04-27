"use client "
import Link from "next/link";
import React from "react";
import { useFormik } from "formik";
import { login_schema } from "@/utils/validation-schema";
import ErrorMessage from "@/utils/ErrorMessage";
const LoginFrom = () => {
  // use formik
  const { handleChange, handleSubmit, handleBlur, errors, values, touched } =
    useFormik({
      initialValues: {
        email: "",
        password: "",
        username: "",
      },
      validationSchema: login_schema,
      onSubmit: (values, { resetForm }) => {
        resetForm();
        console.log(values)
      },
    });
  return (
    <>
      <form onSubmit={handleSubmit} className="login-form" action="#">
        <div className="row">
          <div className="col-md-12">
            <div className="single-input-unit">
              <label htmlFor="m-id">Email</label>
              <input
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                type="email"
                placeholder="Enter Your Email"
              />
              {touched.email && <ErrorMessage error={errors.email} />}
            </div>
          </div>
          <div className="col-md-6">
            <div className="single-input-unit">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                name="username"
                id="username"
                placeholder="Username"
                defaultValue={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
               {touched.username && <ErrorMessage error={errors.username} />}
            </div>
          </div>
          <div className="col-md-6">
            <div className="single-input-unit">
              <label htmlFor="password">Password</label>
              <input
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                type="password"
                placeholder="Password"
                id="password"
              />
              {touched.password && <ErrorMessage error={errors.password} />}
            </div>
          </div>
        </div>
        <div className="login-btn">
          <button className="fill-btn">Sign in Account</button>
          <div className="note">
            Not yet registered?{" "}
            <Link className="text-btn" href="/register">
              Sign up
            </Link>
          </div>
        </div>
      </form>
    </>
  );
};

export default LoginFrom;
