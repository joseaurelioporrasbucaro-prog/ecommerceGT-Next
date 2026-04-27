"use client"
import { Gender } from "@/data/nice-select-data";
import { useFormik } from "formik";
import Link from "next/link";
import React,{useState} from "react";
import { register_schema } from "@/utils/validation-schema";
import ErrorMessage from "@/utils/ErrorMessage";
import NiceSelectForm from "@/elements/niceSelect/NiceSelectForm";
const RegisterForm = () => {
  const [selelectForm, setSelelectForm] = useState<string>("")
  const { handleChange, handleSubmit, handleBlur, errors, values, touched } =
    useFormik({
      initialValues: {
        name: "",
        lastname: "",
        email: "",
        password: "",
        username: "",
        selelectForm
      },
      validationSchema: register_schema, 
      onSubmit: (values, { resetForm }) => {
        resetForm();
        console.log(values,selelectForm);
      },
    });

  const selectHandler = () => {}
  return (
    <>
      <form onSubmit={handleSubmit} className="sign-up-form" action="#">
        <div className="row">
          <div className="col-md-6">
            <div className="single-input-unit">
              <label htmlFor="name">First Name</label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Your first name"
                defaultValue={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {touched.name && <ErrorMessage error={errors.name} />}
            </div>
          </div>
          <div className="col-md-6">
            <div className="single-input-unit">
              <label htmlFor="lastname">Last Name</label>
              <input
                type="text"
                name="lastname"
                id="lastname"
                placeholder="Your last name"
                defaultValue={values.lastname}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              
              {touched.lastname && <ErrorMessage error={errors.lastname} />}
            </div>
          </div>
          <div className="col-md-6">
            <div className="single-input-unit mb-30">
              <label htmlFor="g-select">Gender</label>
              <div className="w-full">
               
                <NiceSelectForm
                options={Gender}
                defaultCurrent={0}
                onChange={selectHandler}
                setSelelectForm={setSelelectForm}
                name="g-select"
                className="gender-category-select"
              />
 
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="single-input-unit">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Your email"
                defaultValue={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
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
                type="password"
                name="password"
                id="password"
                placeholder="********"
                defaultValue={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
               {touched.password && <ErrorMessage error={errors.password} />}
            </div>
          </div>
        </div>
        <div className="sign-up-btn">
          <button className="fill-btn" type="submit">Create Account</button>
          <div className="note">
            Already have an account?{" "}
            <Link className="text-btn" href="/login">
              Sign In
            </Link>
          </div>
        </div>
      </form>
    </>
  );
};

export default RegisterForm;
