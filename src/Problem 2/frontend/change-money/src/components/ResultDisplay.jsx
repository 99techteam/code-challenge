import { format } from "date-fns";
import { enUS } from "date-fns/locale";

const ResultDisplay = ({ result }) => {
  if (!result) return null;

  const formattedTime = format(
    new Date(result.timestamp),
    "'At' dd/MM/yyyy HH 'hours' mm 'minutes' ss 'seconds'",
    { locale: enUS }
  );
  const [datePart, timePart] = formattedTime.split(" ");
  const formattedMessage = `${datePart} <span class="text-orange-300 font-bold">${timePart}</span> the amount converted from ${result.from} to ${result.to} is ${result.converted}`;

  return (
    <div className="mt-6 p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg transform transition-all hover:scale-[1.02] duration-300">
      <div className="flex flex-col gap-3">
        <p className="text-lg font-semibold tracking-wide">
          {result.amount} {result.from} ={" "}
          <span className="text-yellow-300 font-bold">
            {result.converted} {result.to}
          </span>
        </p>
        <p
          className="text-sm opacity-90"
          dangerouslySetInnerHTML={{ __html: formattedMessage }}
        ></p>
        <div className="flex flex-col text-xs opacity-80">
          <span>
            Price {result.from}: {result.fromPrice}
          </span>
          <span>
            Price {result.to}: {result.toPrice}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
