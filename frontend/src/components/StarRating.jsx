import React from "react";
import { assets } from "../assets/assets";

const StarRating = ({ rating = 5 }) => {
  const rounded = Math.round(Number(rating) || 5);
  return (
    <>
      {Array(5)
        .fill("")
        .map((_, index) => (
          <img
            key={index}
            src={rounded > index ? assets.starIconFilled : assets.starIconOutlined}
            alt="star-icon"
            className="w-4.5 h-4.5"
          />
        ))}
    </>
  );
};

export default StarRating;
