/** Intervalo [início do mês, início do mês seguinte) em UTC. `month` é 1-12. */
export function monthRange(year: number, month: number) {
  return {
    startDate: new Date(Date.UTC(year, month - 1, 1)),
    endDate: new Date(Date.UTC(year, month, 1)),
  };
}
