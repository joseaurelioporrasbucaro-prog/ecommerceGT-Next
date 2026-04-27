"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import Link from "next/link";
import { contact_schema } from "@/utils/validation-schema";
import ErrorMessage from "@/utils/ErrorMessage";
import NiceSelectForm from "@/elements/niceSelect/NiceSelectForm";
import { selectSubject } from "@/data/nice-select-data";

const ContactFormSection = () => {
  const [selelectForm, setSelelectForm] = useState<string>("");
  const { handleChange, handleSubmit, handleBlur, errors, values, touched } =
    useFormik({
      initialValues: {
        name: "",
        email: "",
        phone: "",
        message: "",
      },
      validationSchema: contact_schema,
      onSubmit: (values, { resetForm }) => {
        resetForm();
        console.log(values)
      },
    });

  const selectHandler = () => {};

  return (
    <div className="contact-wrapper pos-rel mb-40 wow fadeInUp">
      <div className=" contact-inner">
        <div className="contact-content">
          <h4>Get in Touch</h4>
          <p className="mb-35">
            Please feel free to contact with us for any kinds of inquiries and
            information. Our support team always available to help the clients.
          </p>
          <form onSubmit={handleSubmit} className="contact-form" action="#">
            <div className="row">
              <div className="col-md-6">
                <div className="single-input-unit">
                  <label htmlFor="name">Your Name</label>
                  <input
                    type="text"
                    name="name" 
                    id="name"
                    placeholder="Your name"
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
                  <label htmlFor="phone">Phone</label>
                  <input
                type="text"
                name="phone"
                id="phone"
                placeholder="Your Phone"
                defaultValue={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {touched.phone && <ErrorMessage error={errors.phone} />}
                </div>
              </div>
              <div className="col-md-6">
                <div className="single-input-unit">
                  <label htmlFor="s-select">Subject</label>
                  <div className="mb-30 w-full">
                    <NiceSelectForm
                      options={selectSubject}
                      defaultCurrent={0}
                      onChange={selectHandler}
                      setSelelectForm={setSelelectForm}
                      name="s-select"
                      className="gender-category-select"
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                <div className="single-input-unit">
                  <label htmlFor="message">Message</label>
                  <textarea
                    name="message"
                    id="message"
                    placeholder="Write a messages..."
                    defaultValue={values.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  ></textarea>
                    {touched.message && <ErrorMessage error={errors.message} />}
                </div>
              </div>
            </div>
            <div className="contact-btn">
              <div className="note">
                By check this box I agree with{" "}
                <Link className="text-btn" href="/terms">
                  Terms & Conditions
                </Link>
              </div>
              <button className="fill-btn">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactFormSection;
