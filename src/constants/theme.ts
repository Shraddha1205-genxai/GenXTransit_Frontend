export const T = {
  ink: "#101B26",
  ink2: "#182634",
  inkBorder: "#26384A",
  canvas: "#EFEEE6",
  panel: "#FFFFFF",
  border: "#DEDBCF",
  text: "#16212B",
  textSoft: "#5B6672",
  textFaint: "#8B9098",
  amber: "#E5A339",
  amberDeep: "#8A5A14",
  amberFill: "#FBEBD1",
  green: "#2F8F5B",
  greenFill: "#E1F3E9",
  red: "#C6453B",
  redFill: "#FBE7E5",
  blue: "#3E7CB1",
  blueFill: "#E5EFF6",
  gray: "#8B9098",
  grayFill: "#EEEDE7",
};

export const fontStack = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
  .stc-display { font-family: 'Oswald', sans-serif; letter-spacing: 0.01em; }
  .stc-body { font-family: 'IBM Plex Sans', sans-serif; }
  .stc-mono { font-family: 'IBM Plex Mono', monospace; }
  .stc-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
  .stc-scroll::-webkit-scrollbar-thumb { border-radius: 4px; }
  .stc-row:hover { background: #FAFAF6; }
  .stc-navitem { position: relative; }
  .stc-navitem.active::before {
    content: ''; position: absolute; left: 0; top: 6px; bottom: 6px; width: 3px;
    background: ${T.amber}; border-radius: 0;
  }
`;
