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
  const classes = `flex items-center justify-center gap-2 bg-orange rounded-[60px] py-4 px-10 h-[51px] cursor-pointer transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${className}`;
  const style = { width, height };

  const content = (
    <>
      {icon && iconPosition === "left" && icon}
      <span className={labelClassName}>{label}</span>
      {icon && iconPosition === "right" && icon}
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
