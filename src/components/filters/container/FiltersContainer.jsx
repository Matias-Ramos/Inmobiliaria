import {
  // Components
  LocationFilter,
  PriceContainer,
  SlidersContainer,
  BuildStatusFilter,
  SurfaceFilterContainer,
  CleanBtn,
  // Hooks
  useContext,
  useReducer,
  useMemo,
  useEffect,
  useLocation,
  useMediaQuery,
  // --ctxt
  queryCtxt,
  // -- reducer
  filterModifier,
  defaultFilterValues,
  // Bts
  Container,
  Nav,
  Navbar,
  Dropdown,
  // Animation
  motion,
  getFiltersVariant,
} from "./imports.js";

const FiltersContainer = ({ previousURL }) => {
  /****************************** */
  // Functions & Values

  const { searchQyParams, updateQyParams, deleteQyParam } =
    useContext(queryCtxt);
  const [filters, dispatch] = useReducer(filterModifier, defaultFilterValues);
  const URLpath = useLocation().pathname;
  const filtersProps = useMemo(() => {
    return {
      filters: filters,
      dispatch: dispatch,
      updateQyParams: updateQyParams,
      deleteQyParam: deleteQyParam,
    };
  });

  /****************************** */
  // Animation & Style

  const isDesktop = useMediaQuery("(min-width:992px)");
  const isFirstRender =
    previousURL === "/" || previousURL === undefined ? true : false; //undefined = page loaded from url
  const filtersVariant = getFiltersVariant(isDesktop, isFirstRender);
  const alignCenter = { display: "flex", alignItems: "center" };

  /****************************** */
  /* verifies qyParam on first render and if there are such,
   it updates the useReducer values (before even rendering the filters).*/

  useEffect(() => {
    searchQyParams.get("location") !== null &&
      dispatch({
        type: "locationChgd",
        location: searchQyParams.get("location"),
      });

    /********************* */
    const chgReducerPrice = (newPrice, edge) =>
      dispatch({
        type: `priceChgd`,
        newPrice: newPrice,
        edge: edge,
      });
    searchQyParams.get("price_init") !== null &&
      chgReducerPrice(parseInt(searchQyParams.get("price_init")), "init");
    searchQyParams.get("price_limit") !== null &&
      chgReducerPrice(parseInt(searchQyParams.get("price_limit")), "limit");

    /********************* */

    const chgReducerRoom = (newRoomValue, dispatchRoom, edge, roomName) => {
      dispatch({
        type: dispatchRoom,
        newRoomValue: newRoomValue,
        edge: edge,
        roomName: roomName,
      });
    };
    const rooms = ["env", "bedroom", "bathroom", "garage"];
    for (let room of rooms) {
      const roomInitQyParams = searchQyParams.get(`${room}_init`);
      const roomLimitQyParams = searchQyParams.get(`${room}_limit`);

      roomInitQyParams !== null &&
        chgReducerRoom(parseInt(roomInitQyParams), `${room}Chgd`, "init", room);
      roomLimitQyParams !== null &&
        chgReducerRoom(
          parseInt(roomLimitQyParams),
          `${room}Chgd`,
          "limit",
          room
        );
    }

    /********************* */

    const chgReducerSurface = (newSurface, surfaceType, edge) => {
      dispatch({
        type: "surfaceChgd",
        newSurface: newSurface,
        surfaceType: surfaceType,
        edge: edge,
      });
    };
    const surfaceTypes = ["total", "covered"];
    for (let type of surfaceTypes) {
      const roomInitQyParams = searchQyParams.get(`${type}_surface_init`);
      const roomLimitQyParams = searchQyParams.get(`${type}_surface_limit`);

      roomInitQyParams !== null &&
        chgReducerSurface(parseInt(roomInitQyParams), type, "init");

      roomLimitQyParams !== null &&
        chgReducerSurface(parseInt(roomLimitQyParams), type, "limit");
    }

    /********************* */

    if (searchQyParams.get("building_status") !== null) {
      const preFilteredStatuses = searchQyParams
        .get("building_status")
        .split("-or-");
      const allStatuses = Object.keys(filters.buildingStatus);
      const nonChosenstatuses = allStatuses.filter(function (obj) {
        return preFilteredStatuses.indexOf(obj) == -1;
      });
      for (let status of nonChosenstatuses) {
        dispatch({
          type: "buildingStatusChgd",
          status: status,
          isChecked: false,
        });
      }
    }
  }, []);

  /****************************** */
  // Rendering

  return (
    <Navbar variant="dark" bg="dark" expand="lg" sticky="top">
      <Container fluid>
        <Navbar.Brand>Filtros: </Navbar.Brand>
        <Navbar.Toggle aria-controls="navigation-bar" />
        <Navbar.Collapse id="navigation-bar">
          <motion.div
            id="filtersMotionParent"
            variants={filtersVariant}
            initial="initial"
            animate="animate"
          >
            <Nav navbarScroll>
              {/* ******** */}
              {/* Location */}
              <Dropdown
                title="Ubicación"
                filterComponent={<LocationFilter props={filtersProps} />}
                filtersVariant={filtersVariant}
                alignCenter={alignCenter}
              />

              {/* ***** */}
              {/* Price */}
              <Dropdown
                title="Precio"
                filterComponent={<PriceContainer props={filtersProps} />}
                filtersVariant={filtersVariant}
                previousURL={previousURL}
                alignCenter={alignCenter}
              />

              {/* ******* */}
              {/* Sliders */}
              <Dropdown
                title="Habitaciones"
                filterComponent={<SlidersContainer props={filtersProps} />}
                filtersVariant={filtersVariant}
                previousURL={previousURL}
                alignCenter={alignCenter}
              />

              {/* ******* */}
              {/* Surface */}
              {(URLpath === "/venta-inmuebles" ||
                URLpath === "/emprendimientos") && (
                <Dropdown
                  title="Superficie"
                  filterComponent={
                    <SurfaceFilterContainer props={filtersProps} />
                  }
                  filtersVariant={filtersVariant}
                  previousURL={previousURL}
                  alignCenter={alignCenter}
                />
              )}

              {/* *********** */}
              {/* BuildStatus */}
              {URLpath === "/emprendimientos" && (
                <Dropdown
                  title="Etapa"
                  filterComponent={<BuildStatusFilter props={filtersProps} />}
                  filtersVariant={filtersVariant}
                  previousURL={previousURL}
                  alignCenter={alignCenter}
                />
              )}
            </Nav>
            <motion.div variants={filtersVariant} style={alignCenter}>
              <Navbar.Text>
                <CleanBtn dispatch={dispatch} />
              </Navbar.Text>
            </motion.div>
          </motion.div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default FiltersContainer;
