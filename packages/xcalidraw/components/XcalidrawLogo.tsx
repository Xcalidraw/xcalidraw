import "./XcalidrawLogo.scss";

const LogoText = () => {
  return (
    <text
      fill="#087f5b"
      fontSize="300"
      fontWeight="normal"
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      className="logo-text"
    >
      <span className="logo-text-bigger">X</span>calidraw
    </text>
  );
};

export default LogoText;

type LogoSize = "xs" | "small" | "normal" | "large" | "custom" | "mobile";

interface LogoProps {
  size?: LogoSize;
  withText?: boolean;
  style?: React.CSSProperties;
  /**
   * If true, the logo will not be wrapped in a Link component.
   * The link prop will be ignored as well.
   * It will merely be a plain div.
   */
  isNotLink?: boolean;
}

export const XcalidrawLogo = ({
  style,
  size = "small",
  withText,
}: LogoProps) => {
  return (
    <div className={`XcalidrawLogo is-${size}`} style={style}>
      {withText && <LogoText />}
    </div>
  );
};
