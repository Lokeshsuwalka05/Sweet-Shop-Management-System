import React from "react";

export const Button = React.forwardRef(
  (
    { className = "", variant = "default", size = "default", ...props },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      default:
        "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600",
      outline:
        "border border-gray-300 bg-white hover:bg-gray-50 focus-visible:ring-gray-400",
      ghost: "hover:bg-gray-100 focus-visible:ring-gray-400",
      destructive:
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-xs",
      lg: "h-12 px-8",
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return <button className={classes} ref={ref} {...props} />;
  }
);

Button.displayName = "Button";
