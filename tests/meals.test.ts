import { describe, it, expect } from "vitest";
import { getMealSummary } from "@/lib/meals";
import { Reservation } from "@/lib/types";

// Record<string, any>: hay que poder cargar datos viejos o de la UI (persons string, "cancelada")
const r = (overrides: Record<string, any>): Reservation =>
  ({
    id: "x",
    unit: "refugio",
    persons: 2,
    startDate: "2026-11-10",
    endDate: "2026-11-12",
    includeBreakfastCampo: false,
    includeBreakfastAmericano: false,
    includeDinner: false,
    status: "approved",
    ...overrides,
  }) as unknown as Reservation;

const byDate = (rows: ReturnType<typeof getMealSummary>) =>
  Object.fromEntries(rows.map((d) => [d.date, d]));

describe("resumen de comidas", () => {
  // del martes 10 al jueves 12: duermen las noches del 10 y del 11
  it("la cena cuenta las noches que duermen; el desayuno, las mañanas siguientes", () => {
    const days = byDate(
      getMealSummary(
        [r({ includeDinner: true, includeBreakfastCampo: true })],
        "2026-11-09",
        5
      )
    );

    expect(days["2026-11-09"]).toMatchObject({ breakfastCampo: 0, dinner: 0 });
    expect(days["2026-11-10"]).toMatchObject({ breakfastCampo: 0, dinner: 2 }); // llegan: cenan, no desayunan
    expect(days["2026-11-11"]).toMatchObject({ breakfastCampo: 2, dinner: 2 });
    expect(days["2026-11-12"]).toMatchObject({ breakfastCampo: 2, dinner: 0 }); // se van: desayunan, no cenan
    expect(days["2026-11-13"]).toMatchObject({ breakfastCampo: 0, dinner: 0 });
  });

  it("suma personas de varias reservas y separa los dos desayunos", () => {
    const [day] = getMealSummary(
      [
        r({ persons: 2, includeBreakfastCampo: true }),
        r({ persons: 3, includeBreakfastAmericano: true }),
        r({ persons: "4", includeBreakfastCampo: true, includeBreakfastAmericano: true }),
      ],
      "2026-11-11",
      1
    );

    expect(day).toEqual({
      date: "2026-11-11",
      breakfastCampo: 6,
      breakfastAmericano: 7,
      dinner: 0,
    });
  });

  it("ignora las reservas canceladas y las que no pidieron nada", () => {
    const [day] = getMealSummary(
      [
        r({ status: "cancelada", includeDinner: true }),
        r({ status: "cancelled", includeDinner: true }),
        r({}),
      ],
      "2026-11-10",
      1
    );

    expect(day.dinner).toBe(0);
  });

  it("cruza fin de mes y de año", () => {
    const days = getMealSummary(
      [r({ startDate: "2026-12-31", endDate: "2027-01-02", includeDinner: true })],
      "2026-12-31",
      3
    );

    expect(days.map((d) => [d.date, d.dinner])).toEqual([
      ["2026-12-31", 2],
      ["2027-01-01", 2],
      ["2027-01-02", 0],
    ]);
  });
});
