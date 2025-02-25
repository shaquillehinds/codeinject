//$lf-ignore
// @ts-nocheck
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import ScreenLayout from "@components/layouts/Screen.layout";
import { transportLayer } from "@transports/TransportLayer";
import { DebugLogger } from "@utils/Logger";
import { ScrollView } from "react-native-gesture-handler";
import { relativeY } from "@utils/constants/Layout.const";
import RowLayout from "@components/layouts/Row.layout";
import { Title } from "@components/typography";
import { theme } from "@utils/themes";
import Plus from "@components/svgs/outline/Plus";
import { useActions } from "@hooks/useActions";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import LocationCard from "@components/screens/business-locations/Location.card";

export default function BusinessLocationsScreen() {
  const [locations, setLocations] = useState<BusinessLocation[]>([]);
  const actions = useActions();
  const router = useRouter();
  const onAddNewLocation = () =>
    router.navigate({
      pathname: "/platform/settings/business-location",
      params: { data: JSON.stringify({ mode: "Add", locations }) }
    });
  const gangGang = useCallback(() => {}, []);
  const focused = useIsFocused();
  function game() {}
  const game2 = function () {};
  const game3 = () => {};
  const game4 = useCallback(() => {}, []);
  useEffect(() => {}, []);
  useEffect(() => {
    if (focused)
      (async () => {
        const res = await transportLayer.mainTransport.getSetting(true);

        // log('warn', res);
        if (res.data) setLocations(res.data.businessLocations);
        else console.warn(res.error);
      })();
  }, [focused]);
  return (
    <ScreenLayout>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <RowLayout
          margin={[3, 0]}
          width={100}
          center
          centerX
          onTouchStart={onAddNewLocation}>
          <Plus color={theme.primary.dark} />
          <Title margin={[0, 0, 0, 3]} customColor={theme.primary.dark}>
            Add new location
          </Title>
        </RowLayout>
        {locations?.map((location, index) => (
          <LocationCard
            key={JSON.stringify(location)}
            location={location}
            onDeletePress={async () => {
              const newLocations = locations.filter((a, i) => i !== index);
              const updatedInfo = { businessLocations: newLocations };
              try {
                const res = await transportLayer.mainTransport.updateSetting(
                  updatedInfo,
                  true
                );
                if (res.data) {
                  setLocations(newLocations);
                  actions.inAppNotification({
                    type: "success",
                    title: "Delete successful"
                  });
                } else if (res.error) {
                  actions.inAppNotification({
                    type: "error",
                    title: "Error",
                    message: res.error.message
                  });
                  console.warn(res.error);
                }
              } catch (error: any) {
                actions.inAppNotification({
                  type: "error",
                  title: "An unexpected error occured",
                  message: "Check your internet connection or try again later."
                });
                console.warn(error);
              }
            }}
            onPress={() =>
              router.navigate({
                pathname: "/platform/settings/business-location",
                params: {
                  data: JSON.stringify({
                    locations,
                    location,
                    mode: "Edit",
                    index
                  })
                }
              })
            }
          />
        ))}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    alignItems: "center",
    paddingBottom: relativeY(5)
  }
});
