
function formatIndianNumber(x) {
  if (x === undefined || x === null) return x;
  const s = x.toString();
  
  const parts = s.split(".");
  let intPart = parts[0];
  const decPart = parts.length > 1 ? parts.slice(1).join('.') : null;

  
  let sign = "";
  if (intPart.startsWith("-")) {
    sign = "-";
    intPart = intPart.slice(1);
  }

  if (intPart.length <= 3) {
    return decPart != null ? `${sign}${intPart}.${decPart}` : `${sign}${intPart}`;
  }

  const lastThree = intPart.slice(-3);
  let rest = intPart.slice(0, -3);
  
  rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  const formatted = `${sign}${rest},${lastThree}`;
  return decPart != null ? `${formatted}.${decPart}` : formatted;
}

function toPlain(obj) {
  if (!obj) return obj;
  if (typeof obj.get === "function") return obj.get({ plain: true });
  if (typeof obj.toObject === "function") return obj.toObject();
  return Object.assign({}, obj);
}

function formatObjectPrices(o) {
  if (!o || typeof o !== "object") return o;
  const out = Object.assign({}, o);
  const fields = [
    "price",
    "buyingPrice",
    "quotingPrice",
    "sellingPrice",
    "expectedPrice",
    "saleAmount",
    "total",
    "totalAmount",
    "taxAmount",
    "grandTotal",
    "balanceDue",
    "downPayment",
  ];
  for (const f of fields) {
    if (out[f] !== undefined && out[f] !== null) {
      out[f] = formatIndianNumber(out[f]);
    }
  }
  return out;
}

function formatCarInstance(car) {
  if (!car) return car;
  const plain = toPlain(car);
  return formatObjectPrices(plain);
}

module.exports = { formatIndianNumber, formatObjectPrices, formatCarInstance };
