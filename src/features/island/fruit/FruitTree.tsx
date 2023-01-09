import React, { useState } from "react";

import { getTimeLeft } from "lib/utils/time";
import { setImageWidth } from "lib/images";
import { PlantedFruit } from "features/game/types/game";
import useUiRefresher from "lib/utils/hooks/useUiRefresher";
import { FRUIT, FruitName, FRUIT_SEEDS } from "features/game/types/fruits";
import { FRUIT_LIFECYCLE } from "./fruits";
import { Soil } from "./Soil";

import { Seedling } from "./Seedling";
import { ReplenishingTree } from "./ReplenishingTree";
import { FruitDropAnimator } from "components/animation/FruitDropAnimator";

import apple from "/src/assets/resources/apple.png";
import orange from "/src/assets/resources/orange.png";
import blueberry from "/src/assets/resources/blueberry.png";
import axe from "assets/tools/axe.png";
import { InfoPopover } from "../common/InfoPopover";

export const getFruitImage = (fruitName: FruitName): string => {
  switch (fruitName) {
    case "Apple":
      return apple;
    case "Orange":
      return orange;
    case "Blueberry":
      return blueberry;
  }
};

interface Props {
  plantedFruit?: PlantedFruit;
  playing: boolean;
  plantTree: () => void;
  harvestFruit: () => void;
  removeTree: () => void;
  onError: () => void;
  playAnimation: boolean;
  /**
   * Handles showing "hover" information on mobile or "error" on click action information
   */
  showOnClickInfo: boolean;
}

export const FruitTree: React.FC<Props> = ({
  plantedFruit,
  plantTree,
  harvestFruit,
  removeTree,
  onError,
  playing,
  playAnimation,
  showOnClickInfo,
}) => {
  useUiRefresher({ active: !!plantedFruit });
  //UI Refresher reloads this component after a regular time intervals.
  //which results to pre loading of the image again and again.
  const [alreadyPreloaded, setAlreadyPreloaded] = useState(false);

  const preloadImage = (url: string) => {
    const img = new Image();
    img.src = url;
    setAlreadyPreloaded(true);
  };

  if (!plantedFruit) {
    return (
      <Soil
        showOnClickInfo={showOnClickInfo}
        playing={playing}
        onClick={plantTree}
      />
    );
  }

  const { name, amount, harvestsLeft, harvestedAt, plantedAt } = plantedFruit;
  const { seed, isBush } = FRUIT()[name];
  const { plantSeconds } = FRUIT_SEEDS()[seed];
  const lifecycle = FRUIT_LIFECYCLE[name];

  // Dead tree
  if (!harvestsLeft) {
    return (
      <>
        <FruitDropAnimator
          mainImageProps={{
            src: lifecycle.dead,
            className: "relative cursor-pointer hover:img-highlight",
            style: {
              bottom: "-9px",
              zIndex: "1",
            },
            onLoad: (e) => setImageWidth(e.currentTarget),
            onClick: removeTree,
          }}
          dropImageProps={{
            src: getFruitImage(name),
          }}
          dropCount={amount}
          playDropAnimation={playAnimation}
          playShakeAnimation={false}
        />

        <InfoPopover
          showPopover={showOnClickInfo}
          position={{ top: -2, left: 23 }}
        >
          <div className="flex flex-1 items-center text-xxs justify-center text-white px-2 py-1 whitespace-nowrap">
            <img src={axe} className="w-4 mr-1" />
            <span>No Axe Selected!</span>
          </div>
        </InfoPopover>
      </>
    );
  }

  // Replenishing tree
  if (harvestedAt) {
    const replenishingTimeLeft = getTimeLeft(harvestedAt, plantSeconds);

    if (replenishingTimeLeft > 0) {
      return (
        <ReplenishingTree
          onClick={onError}
          plantedFruit={plantedFruit}
          playAnimation={playAnimation}
          showOnClickInfo={showOnClickInfo}
        />
      );
    }
  }

  // Seedling
  const growingTimeLeft = getTimeLeft(plantedAt, plantSeconds);

  if (growingTimeLeft > 0) {
    return (
      <Seedling
        onClick={onError}
        playing={playing}
        plantedFruit={plantedFruit}
        showOnClickInfo={showOnClickInfo}
      />
    );
  }

  //Pre loading the harvested tree image so that we get a smooth transition
  // when the user clicks on the ready tree and it transitions to the harvest state.
  if (!alreadyPreloaded) {
    preloadImage(lifecycle.harvested);
    preloadImage(getFruitImage(name));
  }

  // Ready tree
  return (
    <div className="flex justify-center cursor-pointer h-full w-full hover:img-highlight">
      <img
        className="relative"
        style={{
          bottom: `${isBush ? "-11px" : "25px"}`,
          zIndex: "1",
        }}
        src={lifecycle.ready}
        onLoad={(e) => setImageWidth(e.currentTarget)}
        onClick={harvestFruit}
      />
    </div>
  );
};