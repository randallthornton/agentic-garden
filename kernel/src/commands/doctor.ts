import { runDoctor } from "../core/doctor.js";

export function doctorCommand(root: string): number {
  const report = runDoctor(root);

  for (const item of report.info) {
    console.log(`info: ${item}`);
  }
  for (const warning of report.warnings) {
    console.warn(`warn: ${warning}`);
  }
  for (const error of report.errors) {
    console.error(`error: ${error}`);
  }

  if (report.errors.length === 0 && report.warnings.length === 0) {
    console.log("ok: the plot is consistent");
  }

  return report.errors.length > 0 ? 1 : 0;
}
