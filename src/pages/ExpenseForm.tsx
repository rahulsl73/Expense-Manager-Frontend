import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../hooks";
import api from "../api/api";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ExpenseFormProps {
  onSuccess: () => void;
  initialValues?: {
    id?: number;
    title: string;
    amount: number;
    category: string;
    date: string;
    tags: string[];
    note: string | null;
  };
}

interface FormValues {
  title: string;
  amount: number;
  category: string;
  date: Date;
  tags: string;
  note: string;
}

interface SummaryResponse {
  totalSpent: number;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSuccess, initialValues }) => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const isEdit = Boolean(initialValues?.id);

  const [remaining, setRemaining] = useState<number>(0);
  const [loadingRem, setLoadingRem] = useState<boolean>(true);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  const getCurrentMonthRange = () => {
    const today = new Date();
    return {
      start: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`,
      end: today.toISOString().slice(0, 10),
    };
  };

  const fetchRemaining = async () => {
    if (!user) return;
    setLoadingRem(true);
    try {
      const { start, end } = getCurrentMonthRange();
      const res = await api.get<SummaryResponse>(
        `/user/${user.id}/expenses/stats/summary`,
        { params: { start, end } }
      );
      setRemaining(user.monthlyBudget - res.data.totalSpent);
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    } finally {
      setLoadingRem(false);
    }
  };

  useEffect(() => {
    fetchRemaining();
  }, [user]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 shadow rounded transition-colors">
      <h2 className="text-xl mb-4 text-gray-900 dark:text-gray-100">
        {isEdit ? "Edit Expense" : "Add Expense"}
      </h2>

      <Formik<FormValues>
        enableReinitialize
        initialValues={{
          title: initialValues?.title || "",
          amount: initialValues?.amount || 0,
          category: initialValues?.category || "",
          date: initialValues ? new Date(initialValues.date) : new Date(),
          tags: initialValues ? initialValues.tags.join(",") : "",
          note: initialValues?.note || "",
        }}
        validationSchema={Yup.object({
          title: Yup.string().required("Required"),
          amount: Yup.number().required("Required").positive("Must be positive"),
          category: Yup.string().required("Required"),
          date: Yup.date().required("Required"),
        })}
        onSubmit={async (values, { setSubmitting }: FormikHelpers<FormValues>) => {
          if (!user) return;
          setSubmitting(true);

          if (!isEdit && remaining <= 0) {
            toast.error("Your budget is exhausted for this month.");
            setSubmitting(false);
            return;
          }
          if (!isEdit && values.amount > remaining) {
            toast.error(`Amount exceeds remaining budget of ${remaining.toFixed(2)}`);
            setSubmitting(false);
            return;
          }

          const payload = {
            title: values.title,
            amount: values.amount,
            category: values.category,
            date: values.date.toISOString().split("T")[0],
            tags: values.tags.split(",").map((t) => t.trim()).filter(Boolean),
            note: values.note.trim() || null,
          };

          try {
            if (isEdit) {
              await api.put(`/user/${user.id}/expenses/${initialValues!.id}`, payload);
              toast.success("Expense updated!");
            } else {
              await api.post(`/user/${user.id}/expenses`, payload);
              toast.success("Expense added!");
            }
            await fetchRemaining();
            onSuccess();
          } catch (err) {
            console.error(err);
            toast.error(`Failed to ${isEdit ? "update" : "add"} expense.`);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, setFieldValue, values }) => {
          const exhausted = !isEdit && remaining <= 0;
          const disabled = isSubmitting || loadingRem || exhausted;

          const btnClasses = `w-full p-2 rounded transition-colors ${
            isSubmitting || loadingRem
              ? "bg-gray-400 cursor-not-allowed text-gray-600"
              : exhausted
              ? "bg-red-500 cursor-not-allowed text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`;

          return (
            <Form className="space-y-4">
              {/* Title, Amount, Category fields */}
              {["title", "amount", "category"].map((field) => (
                <div key={field}>
                  <label className="block mb-1 text-gray-700 dark:text-gray-300">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  {field === "category" ? (
                    <Field
                      as="select"
                      name="category"
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-100"
                    >
                      <option value="" disabled>Select category</option>
                      {["Food","Transport","Utilities","Shopping","Rent","Other"].map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </Field>
                  ) : (
                    <Field
                      name={field}
                      type={field === "amount" ? "number" : "text"}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-100"
                    />
                  )}
                  <ErrorMessage name={field} component="div" className="text-red-500 mt-1" />
                </div>
              ))}

              {/* Date picker */}
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300">Date</label>
                <DatePicker
                  selected={values.date}
                  onChange={(date) => date && setFieldValue("date", date)}
                  dateFormat="yyyy-MM-dd"
                  className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-100"
                />
                <ErrorMessage name="date" component="div" className="text-red-500 mt-1" />
              </div>

              {/* Tags */}
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300">Tags</label>
                <Field
                  name="tags"
                  type="text"
                  className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-100"
                />
                <ErrorMessage name="tags" component="div" className="text-red-500 mt-1" />
              </div>

              {/* Note */}
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300">Note</label>
                <Field
                  name="note"
                  as="textarea"
                  rows={3}
                  className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-100"
                />
              </div>

              {/* Submit */}
              <button type="submit" disabled={disabled} className={btnClasses}>
                {isSubmitting || loadingRem
                  ? "Submitting..."
                  : exhausted
                  ? "Budget exhausted"
                  : isEdit ? "Update" : "Add"}
              </button>

              {/* Remaining budget message */}
              {!isEdit && remaining > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Remaining budget: {remaining.toFixed(2)}
                </p>
              )}
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default ExpenseForm;
