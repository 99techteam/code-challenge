import { Styles } from "react-modal";

export const customStyles: Styles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    border: "1px solid rgba(255, 255, 255, 0.07)",
    background: "rgb(19, 19, 19)",
    color: "#fff",
    borderRadius: 20,
    minWidth: 418,
    maxHeight: 670,
    paddingLeft: 0,
    paddingRight: 0,
  },
  overlay: {
    background: "rgba(0,0,0,0.5)",
  },
};
