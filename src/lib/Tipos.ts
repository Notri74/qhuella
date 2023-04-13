type Item = {
  id: string;
  scope: string;
  level1: string;
  level2: string;
  level3: string;
  level4: string;
  ColumnText: string;
  UOM: string;
  GHG: {
    [year: string]: {
      [ghg: string]: string;
    };
  };
  AUX?: {
    [year: string]: string;
  };
};

export { Item };
