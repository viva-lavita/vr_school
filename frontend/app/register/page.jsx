"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Button from "@/shared/components/Button/Button";
import Input from "@/shared/components/Input/Input";
import Popup from "@/shared/components/Popup/Popup";
import Select from "@/shared/components/Select/Select";
import { ApiError } from "@/shared/api/client";
import { registerUser } from "@/shared/api/auth";
import { getClasses, getSchools } from "@/shared/api/schools";

const FIELD_LABELS = {
  email: "Email",
  password: "Пароль",
  re_password: "Повторите пароль",
  first_name: "Имя",
  last_name: "Фамилия",
  patronymic_name: "Отчество",
  date_of_birth: "Дата рождения",
  school: "Школа",
  class_number: "Класс",
  child: "Данные ученика",
  non_field_errors: "Ошибка",
  detail: "Ошибка",
};

const REQUIRED_MESSAGE = "Поле должно быть заполненным";
const REQUIRED_PARENT_FIELDS = ["last_name", "first_name", "patronymic_name", "date_of_birth", "email", "password", "re_password"];
const REQUIRED_CHILD_FIELDS = ["last_name", "first_name", "patronymic_name", "date_of_birth", "school", "class_number"];
const NAME_FIELDS = ["last_name", "first_name", "patronymic_name"];

const NAME_PATTERN = /^[а-яёА-ЯЁ\s'-]+$/;
const NAME_ERROR = "Допустимые буквенные символы А-Я";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_ERROR = "Неверный email";

const PASSWORD_PATTERN = /^[A-Za-z\d@#$%&*!]{8,}$/;
const PASSWORD_ERROR =
  "Пароль должен содержать не менее 8 символов, используйте латиницу, спецсимволы (@#$%&*!), заглавные и прописные буквы, цифры";

const MIN_BIRTH_DATE = "1900-01-01";
const MAX_BIRTH_DATE = new Date().toISOString().split("T")[0];

function validateForm(formData) {
  const fieldErrors = {};

  REQUIRED_PARENT_FIELDS.forEach((field) => {
    if (!formData[field].trim()) fieldErrors[field] = REQUIRED_MESSAGE;
  });

  NAME_FIELDS.forEach((field) => {
    if (!fieldErrors[field] && formData[field].trim() && !NAME_PATTERN.test(formData[field].trim())) {
      fieldErrors[field] = NAME_ERROR;
    }
  });

  if (!fieldErrors.email && formData.email.trim() && !EMAIL_PATTERN.test(formData.email.trim())) {
    fieldErrors.email = EMAIL_ERROR;
  }

  if (!fieldErrors.password && formData.password && !PASSWORD_PATTERN.test(formData.password)) {
    fieldErrors.password = PASSWORD_ERROR;
  }

  if (formData.password && formData.re_password && formData.password !== formData.re_password) {
    fieldErrors.re_password = "Пароли не совпадают";
  }

  REQUIRED_CHILD_FIELDS.forEach((field) => {
    if (!String(formData.child[field]).trim()) fieldErrors[`child_${field}`] = REQUIRED_MESSAGE;
  });

  NAME_FIELDS.forEach((field) => {
    const key = `child_${field}`;
    if (!fieldErrors[key] && formData.child[field].trim() && !NAME_PATTERN.test(formData.child[field].trim())) {
      fieldErrors[key] = NAME_ERROR;
    }
  });

  return fieldErrors;
}

function flattenErrors(data) {
  const messages = [];
  const walk = (value) => {
    if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (value && typeof value === "object") {
      Object.entries(value).forEach(([key, nested]) => {
        const label = FIELD_LABELS[key] ?? key;
        if (Array.isArray(nested) && nested.every((item) => typeof item !== "object")) {
          nested.forEach((msg) => messages.push(`${label}: ${msg}`));
        } else {
          walk(nested);
        }
      });
    } else if (value != null) {
      messages.push(String(value));
    }
  };
  walk(data);
  return messages.length ? messages : ["Не удалось выполнить регистрацию. Проверьте введённые данные."];
}

const initialFormData = {
  last_name: "",
  first_name: "",
  patronymic_name: "",
  date_of_birth: "",
  email: "",
  password: "",
  re_password: "",
  child: {
    last_name: "",
    first_name: "",
    patronymic_name: "",
    date_of_birth: "",
    school: "",
    class_number: "",
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const [consentRule, setConsentRule] = useState(false);
  const [consentPD, setConsentPD] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [errors, setErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getSchools()
      .then(setSchools)
      .catch(() => setErrors(["Не удалось загрузить список школ."]));
  }, []);

  useEffect(() => {
    if (!formData.child.school) {
      setClasses([]);
      return undefined;
    }
    let cancelled = false;
    getClasses(formData.child.school)
      .then((data) => {
        if (!cancelled) setClasses(data);
      })
      .catch(() => {
        if (!cancelled) setErrors(["Не удалось загрузить список классов."]);
      });
    return () => {
      cancelled = true;
    };
  }, [formData.child.school]);

  const clearFieldError = (key) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name);
  };

  const handleChildChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, child: { ...prev.child, [name]: value } }));
    clearFieldError(`child_${name}`);
  };

  const handleSchoolChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, child: { ...prev.child, school: value, class_number: "" } }));
    clearFieldError("child_school");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextFieldErrors = validateForm(formData);
    const consentMissing = !consentRule || !consentPD;
    setFieldErrors(nextFieldErrors);
    setErrors(consentMissing ? ["Необходимо согласие с правилами использования сайта и обработкой персональных данных."] : []);
    if (Object.keys(nextFieldErrors).length > 0 || consentMissing) {
      return;
    }
    setLoading(true);
    try {
      await registerUser({
        email: formData.email,
        password: formData.password,
        re_password: formData.re_password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        patronymic_name: formData.patronymic_name,
        date_of_birth: formData.date_of_birth,
        child: {
          first_name: formData.child.first_name,
          last_name: formData.child.last_name,
          patronymic_name: formData.child.patronymic_name,
          date_of_birth: formData.child.date_of_birth,
          school: Number(formData.child.school),
          class_number: Number(formData.child.class_number),
        },
      });
      setSuccess(true);
    } catch (err) {
      setErrors(
        err instanceof ApiError && err.data
          ? flattenErrors(err.data)
          : ["Не удалось отправить запрос. Проверьте соединение и попробуйте снова."]
      );
    } finally {
      setLoading(false);
    }
  };

  const schoolOptions = schools.map((school) => ({ value: school.pk, label: school.name }));
  const classOptions = classes.map((cls) => ({ value: cls.pk, label: cls.name }));

  return (
    <>
      <div className="min-h-screen flex items-center justify-center">
      <div className="md:w-[685px] my-20 min-[1920px]:my-30 bg-light-green px-5 md:px-12 lg:px-15 rounded-4xl">
        <p className="text-h3 text-black uppercase pb-4 text-center pt-12 lg:pt-15">Регистрация</p>
        <p className="text-2 text-black text-center pb-8">Внимание! Регистрацию нового пользователя может осуществить только родитель или законный представитель ученика Цифровой школы.</p>

        <form className="flex flex-col gap-3 mx-auto md:mx-0" onSubmit={handleSubmit} noValidate>
          <p className="text-input text-black pb-1">Данные родителя/законного представителя ученика</p>

          <Input
            name="last_name"
            type="text"
            placeholder="Фамилия"
            required
            clearable
            value={formData.last_name}
            onChange={handleChange}
            error={Boolean(fieldErrors.last_name)}
            errorMessage={fieldErrors.last_name}
          />
          <div className="flex flex-col gap-3 md:flex-row ">
            <div className="md:w-1/2">
              <Input
                name="first_name"
                type="text"
                placeholder="Имя"
                required
                clearable
                value={formData.first_name}
                onChange={handleChange}
                error={Boolean(fieldErrors.first_name)}
                errorMessage={fieldErrors.first_name}
              />
            </div>
            <div className="md:w-1/2">
              <Input
                name="patronymic_name"
                type="text"
                placeholder="Отчество"
                required
                clearable
                value={formData.patronymic_name}
                onChange={handleChange}
                error={Boolean(fieldErrors.patronymic_name)}
                errorMessage={fieldErrors.patronymic_name}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3  md:flex-row">
            <div className="md:w-1/2">
              <Input
                name="date_of_birth"
                type="date"
                placeholder="Дата рождения"
                required
                clearable
                min={MIN_BIRTH_DATE}
                max={MAX_BIRTH_DATE}
                value={formData.date_of_birth}
                onChange={handleChange}
                error={Boolean(fieldErrors.date_of_birth)}
                errorMessage={fieldErrors.date_of_birth}
              />
            </div>
            <div className="md:w-1/2">
              <Input
                name="email"
                type="email"
                placeholder="Email"
                required
                clearable
                value={formData.email}
                onChange={handleChange}
                error={Boolean(fieldErrors.email)}
                errorMessage={fieldErrors.email}
              />
            </div>
          </div>

          <div>
            <p className={fieldErrors.password ? "text-red" : ""}>Пароль должен содержать не менее 8 символов, используйте латиницу, спецсимволы (@#$%&*!), заглавные и прописные буквы, цифры</p>
            <div className="pb-3">
              <Input
                name="password"
                type="password"
                placeholder="Пароль"
                required
                clearable
                value={formData.password}
                onChange={handleChange}
                error={Boolean(fieldErrors.password)}
              />
            </div>
            <Input
              name="re_password"
              type="password"
              placeholder="Повторите пароль"
              required
              clearable
              value={formData.re_password}
              onChange={handleChange}
              error={Boolean(fieldErrors.re_password)}
              errorMessage={fieldErrors.re_password}
            />
          </div>
          <p className="text-input text-black pt-4">Данные ученика</p>
          <div className="flex flex-col gap-3  md:flex-row">
            <div className="md:w-1/2">
              <Input
                name="last_name"
                type="text"
                placeholder="Фамилия"
                required
                clearable
                value={formData.child.last_name}
                onChange={handleChildChange}
                error={Boolean(fieldErrors.child_last_name)}
                errorMessage={fieldErrors.child_last_name}
              />
            </div>
            <div className="md:w-1/2">
              <Input
                name="first_name"
                type="text"
                placeholder="Имя"
                required
                clearable
                value={formData.child.first_name}
                onChange={handleChildChange}
                error={Boolean(fieldErrors.child_first_name)}
                errorMessage={fieldErrors.child_first_name}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3  md:flex-row">
            <div className="md:w-1/2">
              <Input
                name="patronymic_name"
                type="text"
                placeholder="Отчество"
                required
                clearable
                value={formData.child.patronymic_name}
                onChange={handleChildChange}
                error={Boolean(fieldErrors.child_patronymic_name)}
                errorMessage={fieldErrors.child_patronymic_name}
              />
            </div>
            <div className="md:w-1/2">
              <Input
                name="date_of_birth"
                type="date"
                placeholder="Дата рождения"
                required
                clearable
                min={MIN_BIRTH_DATE}
                max={MAX_BIRTH_DATE}
                value={formData.child.date_of_birth}
                onChange={handleChildChange}
                error={Boolean(fieldErrors.child_date_of_birth)}
                errorMessage={fieldErrors.child_date_of_birth}
              />
            </div>
          </div>
          <Select
            name="school"
            placeholder="Школа"
            required
            value={formData.child.school}
            onChange={handleSchoolChange}
            options={schoolOptions}
            error={Boolean(fieldErrors.child_school)}
            errorMessage={fieldErrors.child_school}
          />
          <Select
            name="class_number"
            placeholder="Класс"
            required
            value={formData.child.class_number}
            onChange={handleChildChange}
            options={classOptions}
            disabled={!formData.child.school}
            error={Boolean(fieldErrors.child_class_number)}
            errorMessage={fieldErrors.child_class_number}
          />
          <label className="flex items-start gap-3 cursor-pointer pt-3">
            <input
              type="checkbox"
              required
              checked={consentRule}
              onChange={(e) => setConsentRule(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 appearance-none rounded-[2px] bg-white border-1 border-gray checked:bg-[url('/icons/ui/check.svg')] checked:bg-no-repeat checked:bg-center cursor-pointer"
            />
            <span className="text-black text-input">
              Ознакомлен с <Link href="/terms" className="underline">Правилами</Link> использования сайта.
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer pt-3 pb-5">
            <input
              type="checkbox"
              required
              checked={consentPD}
              onChange={(e) => setConsentPD(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 appearance-none rounded-[2px] bg-white border-1 border-gray checked:bg-[url('/icons/ui/check.svg')] checked:bg-no-repeat checked:bg-center cursor-pointer"
            />
            <span className="text-black text-input">
              Согласие с <Link href="/privacy" className="underline">Положением обработки</Link> и хранения персональных данных (сюда также включены нормы, связанные с обработкой и хранением несовершеннолетних).
            </span>
          </label>

          <Button
            type="submit"
            label={loading ? "Отправка..." : "Зарегестрироваться"}
            width="100%"
            height="51px"
            labelClassName="text-button"
            disabled={loading}
          />

          <p className="text-input text-black text-center pb-12 pt-5">Уже есть аккунт? <Link href="/login" className="underline">Войти в личный кабинет</Link></p>
        </form>
      </div>
      </div>

      <Popup
        open={success}
        onClose={() => {
          setSuccess(false);
          router.push("/login");
        }}
      >
        <p className="text-h4 text-black text-center">Регистрация прошла успешно</p>
      </Popup>
    </>
  );
}
