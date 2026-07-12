import Link from "next/link";

export default function Button({
  label,
  onClick,
  href,
  type = "button",
  width,
  height,
  icon,
  iconPosition = "left",
  disabled = false,
  className = "",
  labelClassName = "",
}) {
  const classes = `relative flex items-center justify-center bg-orange rounded-[60px] py-4 px-10 h-[51px] cursor-pointer transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${className}`;
  const style = { width, height };
  const iconClasses = `absolute top-1/2 -translate-y-1/2 ${iconPosition === "left" ? "left-4" : "right-4"}`;

  const content = (
    <>
      {icon && <span className={iconClasses}>{icon}</span>}
      <span className={labelClassName}>{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} style={style}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      style={style}
    >
      {content}
    </button>
  );
}
