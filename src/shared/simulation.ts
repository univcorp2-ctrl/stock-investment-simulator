// Deprecated: historical simulation has been replaced by strategy selection plus broker payload preview.
export interface SimulationNotice {
  deprecated: true;
  replacement: "strategyAdvisor + execution";
}

export const simulationNotice: SimulationNotice = {
  deprecated: true,
  replacement: "strategyAdvisor + execution"
};
