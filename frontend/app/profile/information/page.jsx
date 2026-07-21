"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/shared/components/Button/Button";
import Input from "@/shared/components/Input/Input";
import Loader from "@/shared/components/Loader/Loader";
import Popup from "@/shared/components/Popup/Popup";
import Select from "@/shared/components/Select/Select";
import { ApiError } from "@/shared/api/client";
import { logoutUser } from "@/shared/api/auth";
import { deleteMe, updateChild, updateMe } from "@/shared/api/profile";
import { getClasses, getSchools } from "@/shared/api/schools";
import { useUser } from "@/shared/context/UserContext";

const MIN_BIRTH_DATE = "1900-01-01";
const MAX_BIRTH_DATE = new Date().toISOString().split("T")[0];

const FIELD_LABELS = {
  email: "Email",
  first_name: "Имя",
  last_name: "Фамилия",
  patronymic_name: "Отчество",
  date_of_birth: "Дата рождения",
  child: "Данные ученика",
  non_field_errors: "Ошибка",
  detail: "Ошибка",
};

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
  return messages.length ? messages : ["Не удалось сохранить изменения. Проверьте введённые данные."];
}

function formDataFromUser(user) {
  return {
    id: user.pk,
    last_name: user.last_name ?? "",
    first_name: user.first_name ?? "",
    patronymic_name: user.patronymic_name ?? "",
    date_of_birth: user.date_of_birth ?? "",
    email: user.email ?? "",
    child: {
      id: user.child?.pk ?? null,
      last_name: user.child?.last_name ?? "",
      first_name: user.child?.first_name ?? "",
      patronymic_name: user.child?.patronymic_name ?? "",
      date_of_birth: user.child?.date_of_birth ?? "",
      school: user.child?.school ?? "",
      class_number: user.child?.class_number ?? "",
    },
  };
}

export default function ProfileInformationPage() {
  const router = useRouter();
  const { user, loading, refetch, setUser } = useUser();
  const [formData, setFormData] = useState(null);
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) setFormData(formDataFromUser(user));
  }, [user]);

  useEffect(() => {
    getSchools()
      .then(setSchools)
      .catch(() => setErrors(["Не удалось загрузить список школ."]));
  }, []);

  useEffect(() => {
    if (!formData?.child.school) {
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
  }, [formData?.child.school]);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteMe(formData.id);
      logoutUser();
      setUser(null);
      router.push("/");
    } catch {
      setDeleteConfirmOpen(false);
      setErrors(["Не удалось удалить аккаунт. Попробуйте снова."]);
    } finally {
      setDeleting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChildChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, child: { ...prev.child, [name]: value } }));
  };

  const handleSchoolChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, child: { ...prev.child, school: value, class_number: "" } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccess(false);
    setSaving(true);
    try {
      await updateMe(formData.id, {
        last_name: formData.last_name,
        first_name: formData.first_name,
        patronymic_name: formData.patronymic_name,
        date_of_birth: formData.date_of_birth,
      });
      if (formData.child.id) {
        await updateChild(formData.child.id, {
          last_name: formData.child.last_name,
          first_name: formData.child.first_name,
          patronymic_name: formData.child.patronymic_name,
          date_of_birth: formData.child.date_of_birth,
          school: Number(formData.child.school),
          class_number: Number(formData.child.class_number),
        });
      }
      await refetch();
      setSuccess(true);
    } catch (err) {
      setErrors(
        err instanceof ApiError && err.data
          ? flattenErrors(err.data)
          : ["Не удалось сохранить изменения. Проверьте соединение и попробуйте снова."]
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full my-20 bg-light-green px-5 md:px-12 lg:px-15 rounded-4xl py-12 min-h-[500px] flex items-center justify-center">
          <Loader size={86} />
        </div>
      </div>
    );
  }

  const schoolOptions = schools.map((school) => ({ value: school.pk, label: school.name }));
  const classOptions = classes.map((cls) => ({ value: cls.pk, label: cls.name }));

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2 text-red">Не удалось загрузить данные профиля.</p>
      </div>
    );
  }

  return (
    <>
    <div className="flex items-center justify-center flex-col">
      <div className="w-full flex flex-col-reverse md:flex-col gap-[15px] md:gap-[22px] py-7 md:pt-15 md:pb-4">
        <p className="text-h3 text-black uppercase text-center md:text-left">Мои данные</p>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-end gap-2 text-input text-black cursor-pointer"
        >
          <img src="/icons/ui/exit.svg" alt="" className="w-[12px] h-[11px]" />
          Выйти из профиля
        </button>
      </div>
      <div className="w-full bg-light-green px-4 md:px-12 lg:px-15 rounded-4xl py-10 md:pb-5 mb-20">
        <form className="flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
          {errors.length > 0 && (
            <div className="text-input text-red">
              {errors.map((message, i) => (
                <p key={i}>{message}</p>
              ))}
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-start gap-3 lg:gap-8">
            <div className="flex flex-col gap-3 lg:w-1/2">
              <p className="text-2 text-black pb-1">Данные родителя/законного представителя ученика</p>
              <Input name="last_name" type="text" placeholder="Фамилия" editable value={formData.last_name} onChange={handleChange} />
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="md:w-1/2">
                  <Input name="first_name" type="text" placeholder="Имя" editable value={formData.first_name} onChange={handleChange} />
                </div>
                <div className="md:w-1/2">
                  <Input name="patronymic_name" type="text" placeholder="Отчество" editable value={formData.patronymic_name} onChange={handleChange} />
                </div>
              </div>
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="md:w-1/2">
                  <Input name="date_of_birth" type="date" placeholder="Дата рождения" editable min={MIN_BIRTH_DATE} max={MAX_BIRTH_DATE} value={formData.date_of_birth} onChange={handleChange} />
                </div>
                <div className="md:w-1/2">
                  <Input name="email" type="email" placeholder="Email" editable value={formData.email} disabled />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:w-1/2">
              <p className="text-2 text-black pt-7 lg:pt-0">Данные ученика</p>
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="md:w-1/2">
                  <Input name="last_name" type="text" placeholder="Фамилия" editable value={formData.child.last_name} onChange={handleChildChange} />
                </div>
                <div className="md:w-1/2">
                  <Input name="first_name" type="text" placeholder="Имя" editable value={formData.child.first_name} onChange={handleChildChange} />
                </div>
              </div>
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="md:w-1/2">
                  <Input name="patronymic_name" type="text" placeholder="Отчество" editable value={formData.child.patronymic_name} onChange={handleChildChange} />
                </div>
                <div className="md:w-1/2">
                  <Input name="date_of_birth" type="date" placeholder="Дата рождения" editable min={MIN_BIRTH_DATE} max={MAX_BIRTH_DATE} value={formData.child.date_of_birth} onChange={handleChildChange} />
                </div>
              </div>
              <Select
                name="school"
                placeholder="Школа"
                value={formData.child.school}
                onChange={handleSchoolChange}
                options={schoolOptions}
              />
              <Select
                name="class_number"
                placeholder="Класс"
                value={formData.child.class_number}
                onChange={handleChildChange}
                options={classOptions}
                disabled={!formData.child.school}
              />
            </div>
          </div>

          <div className="justify-center flex p-10 md:pb-0">
            <Button
              type="submit"
              label={saving ? "Сохранение..." : "Сохранить"}
              width="182px"
              height="51px"
              labelClassName="text-button"
              disabled={saving}
            />
          </div>
          <button
            type="button"
            onClick={() => setDeleteConfirmOpen(true)}
            className="text-red text-input underline text-center md:text-right relative -top-[20px] cursor-pointer w-full"
          >
            Удалить профиль
          </button>
        </form>
      </div>
    </div>

    <Popup open={success} onClose={() => setSuccess(false)}>
      <p className="text-h4 text-black text-center">Изменения успешно сохранены</p>
    </Popup>

    <Popup open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
      <p className="text-h4 text-black text-center pb-10">Вы уверены, что хотите удалить аккаунт?</p>
      <div className="flex gap-[20px] justify-center">
        <Button
          label="Да"
          onClick={handleDeleteAccount}
          disabled={deleting}
          width="120px"
          height="51px"
          labelClassName="text-button"
        />
        <Button
          label="Нет"
          onClick={() => setDeleteConfirmOpen(false)}
          width="120px"
          height="51px"
          labelClassName="text-button text-black"
        />
      </div>
    </Popup>
    </>
  );
}
