import React, { useContext, useState } from "react";
import { useActor } from "@xstate/react";

import token from "assets/icons/token_2.png";

import { Box } from "components/ui/Box";
import { Button } from "components/ui/Button";

import { Context } from "features/game/GameProvider";
import { getKeys } from "features/game/types/craftables";
import { ITEM_DETAILS } from "features/game/types/images";
import { ToastContext } from "features/game/toast/ToastQueueProvider";
import { Decimal } from "decimal.js-light";

import { GARBAGE, GarbageName } from "features/game/types/garbage";
import { getGarbageSellPrice } from "features/game/events/landExpansion/garbageSold";
import { SplitScreenView } from "components/ui/SplitScreenView";
import { ShopSellDetails } from "components/ui/layouts/ShopSellDetails";

export const GarbageSale: React.FC = () => {
  const garbage = getKeys(GARBAGE).sort((a, b) =>
    GARBAGE[a].sellPrice.sub(GARBAGE[b].sellPrice).toNumber()
  );

  const [selectedName, setSelectedName] = useState<GarbageName>(garbage[0]);

  const selected = GARBAGE[selectedName];
  const { setToast } = useContext(ToastContext);
  const { gameService } = useContext(Context);
  const [
    {
      context: { state },
    },
  ] = useActor(gameService);

  const inventory = state.inventory;

  const price = getGarbageSellPrice(selected);
  const amount = inventory[selectedName] || new Decimal(0);

  const sell = (amount = 1) => {
    gameService.send("garbage.sold", {
      item: selectedName,
      amount,
    });

    setToast({
      icon: token,
      content: `+${price?.mul(amount).toString()}`,
    });
  };

  const Action = () => {
    return (
      <div className="flex space-x-1 w-full sm:flex-col sm:space-x-0 sm:space-y-1">
        <Button disabled={amount.lt(1)} onClick={() => sell(1)}>
          Sell 1
        </Button>
        <Button disabled={amount.lt(1)} onClick={() => sell(10)}>
          Sell 10
        </Button>
      </div>
    );
  };

  return (
    <SplitScreenView
      panel={
        <ShopSellDetails
          details={{
            item: selectedName,
          }}
          properties={{
            sfl: price,
          }}
          actionView={Action()}
        />
      }
      content={
        <>
          {garbage.map((name: GarbageName) => (
            <Box
              isSelected={selectedName === name}
              key={name}
              onClick={() => setSelectedName(name)}
              image={ITEM_DETAILS[name].image}
              count={inventory[name] || new Decimal(0)}
            />
          ))}
        </>
      }
    />
  );
};
