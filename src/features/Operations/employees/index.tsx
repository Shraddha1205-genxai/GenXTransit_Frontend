import React, { useState } from "react";
import { Users2, UserCheck, Clock, AlertTriangle } from "lucide-react";
import { SectionHeader, SubTabs, KpiCard } from "../../../components/common";
import Roster, { EmployeeRecord } from "./Roster";
import Attendance, { AttendanceSummaryItem } from "./Attendance";

interface EmployeesPageProps {
  employees: EmployeeRecord[];
  attendanceSummary: AttendanceSummaryItem[];
}

export function Employees({ employees, attendanceSummary }: EmployeesPageProps) {
  const [tab, setTab] = useState("Roster");
  return (
    <div>
      <SectionHeader eyebrow="TBL_MAST_EMPLOYEE · TBL_TRANS_ATTENDANCE · TBL_TRANS_DUTY_ROSTER" title="Employee management" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 12 }}>
        <KpiCard label="Total employees" value="1,842" icon={Users2} />
        <KpiCard label="On duty now" value="601" icon={UserCheck} tone="green" />
        <KpiCard label="On leave" value="34" icon={Clock} tone="amber" />
        <KpiCard label="Absent today" value="12" icon={AlertTriangle} tone="red" />
      </div>
      <SubTabs tabs={["Roster", "Attendance"]} active={tab} onChange={setTab} />
      {tab === "Roster" && <Roster data={employees} />}
      {tab === "Attendance" && <Attendance data={attendanceSummary} />}
    </div>
  );
}

export default Employees;
export * from "./Roster";
export * from "./Attendance";
