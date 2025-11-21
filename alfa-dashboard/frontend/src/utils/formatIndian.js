export const formatIndian = (num) => {
  if (num === undefined || num === null || num === "") return "-";
  const s = num.toString();
  // If already formatted and contains commas in correct positions, return as-is
  if (typeof s === "string" && s.includes(",")) {
    return s;
  }
  const parts = s.split(".");
  let intPart = parts[0];
  const decPart = parts.length > 1 ? parts.slice(1).join('.') : null;
  let sign = "";
  if (intPart.startsWith("-")) {
    sign = "-";
    intPart = intPart.slice(1);
  }
  if (intPart.length <= 3) return decPart != null ? `${sign}${intPart}.${decPart}` : `${sign}${intPart}`;
  const lastThree = intPart.slice(-3);
  let rest = intPart.slice(0, -3);
  rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  const formatted = `${sign}${rest},${lastThree}`;
  return decPart != null ? `${formatted}.${decPart}` : formatted;
};

export default formatIndian;
