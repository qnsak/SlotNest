export type Interval = {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
};

export type AdminCreateIntervalPayload = {
  date: string;
  start_time: string;
  end_time: string;
};
