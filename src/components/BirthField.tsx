import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import { MenuItem } from "@mui/material";

interface Props {
  setValue: any;
}

const BirthField: React.FC<Props> = ({ setValue }) => {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [days, setDays] = useState<string[]>([]);

  const getDaysInMonth = (month: string, year: string) => {
    if (!month || !year) return 31;

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (monthNum === 2) {
      const isLeapYear =
        (yearNum % 4 === 0 && yearNum % 100 !== 0) || yearNum % 400 === 0;
      return isLeapYear ? 29 : 28;
    }

    const monthsWith30Days = [4, 6, 9, 11];
    if (monthsWith30Days.includes(monthNum)) {
      return 30;
    }

    return 31;
  };

  useEffect(() => {
    const maxDays = getDaysInMonth(month, year);
    const newDays = Array.from({ length: maxDays }, (_, i) =>
      (i + 1).toString().padStart(2, "0"),
    );
    setDays(newDays);

    if (month && year && day) {
      const currentDay = parseInt(day);
      if (currentDay > maxDays) {
        setDay(maxDays.toString().padStart(2, "0"));
      }
      const dob = `${year}-${month}-${day}`;
      setValue("dob", dob);
    }
  }, [month, year, day, setValue]);

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDay = e.target.value;
    setDay(newDay);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMonth = e.target.value;
    setMonth(newMonth);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = e.target.value;
    setYear(newYear);
  };

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) =>
    (currentYear - i).toString(),
  );

  return (
    <div>
      <label className="text-sm font-medium text-white mt-2 mb-1 block">
        Date of Birth
      </label>
      <div className="flex gap-2">
        <TextField
          select
          fullWidth
          id="day"
          value={day}
          onChange={handleDayChange}
          variant="outlined"
          size="medium"
          sx={{
            "& .MuiInputLabel-root": { color: "gray" },
            "& .MuiInputLabel-root.Mui-focused": { color: "#2196f3" },
            "& .MuiOutlinedInput-root": {
              color: "white",
              "& fieldset": { borderColor: "gray" },
              "&:hover fieldset": { borderColor: "#2196f3" },
              "&.Mui-focused fieldset": { borderColor: "#2196f3" },
            },
            "& .MuiSvgIcon-root": { color: "gray" },
          }}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
            select: {
              displayEmpty: true,
              renderValue: (value: any) => {
                if (value === "") {
                  return <span className="text-gray-400">Day</span>;
                }
                return value;
              },
            },
          }}
        >
          <MenuItem value="" disabled>
            Day
          </MenuItem>
          {(month && year
            ? days
            : Array.from({ length: 31 }, (_, i) =>
                (i + 1).toString().padStart(2, "0"),
              )
          ).map((d) => (
            <MenuItem key={d} value={d}>
              {d}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          id="month"
          value={month}
          onChange={handleMonthChange}
          variant="outlined"
          size="medium"
          sx={{
            "& .MuiInputLabel-root": { color: "gray" },
            "& .MuiInputLabel-root.Mui-focused": { color: "#2196f3" },
            "& .MuiOutlinedInput-root": {
              color: "white",
              "& fieldset": { borderColor: "gray" },
              "&:hover fieldset": { borderColor: "#2196f3" },
              "&.Mui-focused fieldset": { borderColor: "#2196f3" },
            },
            "& .MuiSvgIcon-root": { color: "gray" },
          }}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
            select: {
              displayEmpty: true,
              renderValue: (value: any) => {
                if (value === "") {
                  return <span className="text-gray-400">Month</span>;
                }
                const monthObj = months.find((m) => m.value === value);
                return monthObj?.label || value;
              },
            },
          }}
        >
          <MenuItem value="" disabled>
            Month
          </MenuItem>
          {months.map((m) => (
            <MenuItem key={m.value} value={m.value}>
              {m.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          id="year"
          value={year}
          onChange={handleYearChange}
          variant="outlined"
          size="medium"
          sx={{
            "& .MuiInputLabel-root": { color: "gray" },
            "& .MuiInputLabel-root.Mui-focused": { color: "#2196f3" },
            "& .MuiOutlinedInput-root": {
              color: "white",
              "& fieldset": { borderColor: "gray" },
              "&:hover fieldset": { borderColor: "#2196f3" },
              "&.Mui-focused fieldset": { borderColor: "#2196f3" },
            },
            "& .MuiSvgIcon-root": { color: "gray" },
          }}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
            select: {
              displayEmpty: true,
              renderValue: (value: any) => {
                if (value === "") {
                  return <span className="text-gray-400">Year</span>;
                }
                return value;
              },
            },
          }}
        >
          <MenuItem value="" disabled>
            Year
          </MenuItem>
          {years.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </TextField>
      </div>
    </div>
  );
};

export default BirthField;
