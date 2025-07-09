export default {
  lands: {
    title: "My Lands",
    emptyState: "No lands added yet",
    addFirst: "Add Your First Land",
    loadMore: "Load More",
    trees: "trees",
    age: "Age",
    soilType: "soil type",
    selectToPredict: "Please select a location to predict yield",
  },

  prediction: {
    title: "Yield Prediction",
    predicted: "Predicted",
    actual: "Actual",
    loading: "Analyzing land data...",
    retry: "Try Again",
    yieldPrediction: "Yield Prediction",
    currentYield: "Current",
    nutsPerTree: "nuts/tree",
    confidenceLevel: "Prediction Confidence",
    impactFactors: "Impact Factors",
    recommendations: "Recommendations",
    recentHistory: "Recent Prediction History",
    noHistory: "No prediction history available",
    viewAllHistory: "View all prediction history",
    deleteConfirmTitle: "Delete Prediction?",
    deleteConfirmMessage:
      "Are you sure you want to delete the prediction for {{year}} at {{location}}?",
    deleteSuccessTitle: "Deleted Successfully",
    deleteSuccessMessage: "The prediction has been deleted.",
    deleteErrorTitle: "Deletion Failed",
    deleteErrorMessage: "Failed to delete the prediction. Please try again.",
    monthRange: "{{start}} - {{end}}",
    confidence: "confidence",
    factors: {
      temperature: "Temperature",
      humidity: "Humidity",
      rainfall: "Rainfall",
      plantAge: "Plant Age",
    },
    historyTitle: "Prediction History",
    loadingHistory: "Loading prediction history...",
    noHistoryTitle: "No prediction history",
    noHistoryText:
      "You haven't made any yield predictions yet. Start by selecting a location and making a prediction.",
    makeNewPrediction: "Make a Prediction",
    viewDetails: "View Details",
    clearFilter: "Clear filter",
    errorLoadingHistory: "Failed to load prediction history. Please try again.",
    compareWithLastYear: "Compare with last year",
    enterActualYield: "Enter actual yield",
    compareWithActualYield: "Compare with actual yield",
    noComparisonTitle: "No Comparison Data",
    noComparisonMessage:
      "No prediction data available for {{year}} at {{location}}",
    insufficientDataTitle: "Insufficient Data",
    insufficientDataMessage: "Not enough prediction history to show a trend",
    actualComparisonTitle: "Prediction Accuracy",
    comparisonTitle: "Year-over-Year Comparison",
    yieldTrendTitle: "Yield Trend Analysis",
    accuracyResult:
      "{{accuracy}}% accuracy. Prediction {{direction}} by {{percent}}%",
    overestimated: "overestimated",
    underestimated: "underestimated",
    comparisonResult:
      "{{currentYear}} yield {{direction}} by {{change}}% compared to {{lastYear}}",
    increased: "increased",
    decreased: "decreased",
    noLastYearData: "No yield data available for {{year}}",
    addActualYield: "Add Actual Yield",
    predictedYield: "Predicted yield",
    actualYieldLabel: "Actual yield",
    enterActualYieldHint: "Enter nuts per tree",
    enterValidYield: "Please enter a valid yield value",
    enterValidNumber: "Please enter a valid number",
    noMonthData: "No monthly prediction data found",
    success: "Success",
    actualYieldAdded: "Actual yield data added successfully",
    failedToAddActualYield: "Failed to add actual yield data",
    noActualYieldTitle: "No Actual Yield Data",
    noActualYieldMessage:
      "No actual yield data has been recorded for this prediction",
    errorTitle: "Error",
    errorFetchingActualYield: "Failed to fetch actual yield data",
    notEnoughData: "Not enough data to analyze trends",
    stableTrend: "Yield has remained relatively stable",
    increasingTrend: "Yield has increased by {{percent}}%",
    decreasingTrend: "Yield has decreased by {{percent}}%",
    predictionResults: "Prediction Results",
    monthlyBreakdown: "Monthly Breakdown",
    accurateTimeframe:
      "The most accurate prediction is within the next 6 months",
    monthPickerLabel: "Month",
    yearPickerLabel: "Year",
    nutsPerHectare: "nuts/hec.",
    predictionStatus: "Prediction Status",
  },

  price: {
    screenTitle: "Coconut Price Prediction",
    infoMessage:
      "Predict coconut prices based on market conditions, supply, and demand factors. Enter accurate data for better predictions.",
    marketConditions: "Market Conditions",
    previousPrices: "Previous Price History",
    yieldNuts: "Yield (million nuts)",
    exportVolume: "Export Volume",
    domesticConsumption: "Domestic Consumption",
    inflationRate: "Inflation Rate (%)",
    predictionDate: "Prediction Date",
    lastMonth: "1 Month Ago",
    threeMonthsAgo: "3 Months Ago",
    sixMonthsAgo: "6 Months Ago",
    twelveMonthsAgo: "12 Months Ago",
    enterValue: "Enter value",
    enterPercentage: "Enter percentage",
    enterPrice: "Enter price (Rs.)",
    predict: "Predict Price",
    validationError: "Validation Error",
    fillAllFields: "Please fill all fields with valid values",
    predictionResult: "Prediction Result",
    predictedPrice: "Predicted Price",
    perNut: "per nut",
    marketFactors: "Market Factors",
    priceHistory: "Price History",
    month: "Month",
    months: "Months",
    autoFillMessage: "Export and domestic values auto-calculated",
    fillRequiredFields: "Please fill all required fields",
    exportPlusDomestic:
      "Export and domestic consumption must equal total yield",
    predictionError: "Prediction Error",
    tryAgainLater: "Something went wrong. Please try again later.",
    newPrediction: "New Prediction",
    optional: "optional",
  },

  common: {
    loadingLocation: "Loading location...",
    cancel: "Cancel",
    delete: "Delete",
    unknownLocation: "Unknown Location",
    years: "years",
    retry: "Retry",
    loadingMore: "Loading more...",
    refreshing: "Refreshing...",
    close: "Close",
    viewAllData: "View Available Data",
    ok: "OK",
    error: "Error",
    submit: "Submit",
    optional: "optional",
    loading: "Loading...",
    weatherUnavailable: "Weather data unavailable",
    save: "Save",
    success: "Success",
    signOut: "Sign Out"
  },

  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],

  navigation: {
    viewPredictionHistory: "View Prediction History",
    coconutPricePredict: "Predict Coconut Prices",
    tabs: {
      home: "Home",
      waterScheduling: "Water Scheduling",
      coconutYield: "Coconut Yield",
      oilYield: "Oil Yield",
      copraId: "Copra ID"
    }
  },

  "water-scheduling": {
    locations: {
      // General location related translations
      locationDetails: "Location Details",
      locationList: "Locations",
      addLocation: "Add Location",
      editLocation: "Edit Location",
      addNewLocation: "Add New Location",
      deleteLocation: "Delete Location",
      createLocation: "Create Location",
      updateLocation: "Update Location",

      // Form fields
      basicInformation: "Basic Information",
      locationName: "Location Name",
      locationNamePlaceholder: "e.g., East Plantation",
      area: "Area (acres)",
      areaPlaceholder: "e.g., 2.5",
      totalTrees: "Total Trees",
      treesPlaceholder: "e.g., 50",
      soilType: "Soil Type",
      selectSoilType: "Select Soil Type",
      plantationDate: "Plantation Date",
      status: "Status",
      descriptionOptional: "Description (Optional)",
      descriptionPlaceholder: "Add notes about this location...",

      // Location coordinates
      locationCoordinates: "Location Coordinates",
      latitude: "Latitude",
      latitudePlaceholder: "e.g., 6.8649",
      longitude: "Longitude",
      longitudePlaceholder: "e.g., 79.8997",
      getCurrentLocation: "Get Current Location",
      locationError: "Location Error",
      locationErrorMessage:
        "Failed to get current location. Please enter coordinates manually.",
      permissionDenied: "Permission Denied",
      permissionDeniedMessage:
        "Permission to access location was denied. Please enable location services.",
      validLatitudeRequired: "Valid latitude is required",
      latitudeRange: "Latitude must be between -90 and 90",
      validLongitudeRequired: "Valid longitude is required",
      longitudeRange: "Longitude must be between -180 and 180",

      // Device related
      deviceAssignment: "Device Assignment",
      loadingAvailableDevices: "Loading available devices...",
      assignDeviceOptional: "Assign a device (optional)",
      device: "Device",
      selectDevice: "Select Device",
      noDevicesAvailable: "No Devices Available",
      registerDeviceQuestion:
        "There are no devices available for assignment. Would you like to register a new device?",
      registerDevice: "Register Device",
      registerNewDevice: "Register New Device",
      removeDevice: "Remove Device",
      remove: "Remove",
      removeDeviceConfirmation:
        "Are you sure you want to remove the assigned device from this location?",
      noDeviceClearSelection: "No device (clear selection)",
      deviceAssignmentDescription:
        "Assigning a device will enable automatic soil moisture readings and improve watering schedule accuracy.",

      // Success/Error messages
      locationCreated: "Location created successfully!",
      locationUpdated: "Location updated successfully!",
      locationDeleted: "Location deleted successfully",
      failedToCreate: "Failed to create location. Please try again.",
      failedToUpdate: "Failed to update location. Please try again.",
      failedToDelete: "Failed to delete location. Please try again later.",
      failedToLoad: "Failed to load location details. Please try again later.",
      failedToFetchDevices:
        "Failed to fetch available devices. Please try again later.",
      failedToAssignDevice:
        "Failed to assign device to location. Please try again.",
      failedToRemoveDevice: "Failed to remove device. Please try again later.",

      // Other translations needed for LocationDetailScreen
      deleteConfirmation:
        "Are you sure you want to delete this location? This action cannot be undone.",
      unableToOpenMaps: "Unable to open maps application",
      plantationDetails: "Plantation Details",
      plantedOn: "Planted on",
      coordinates: "Coordinates",
      description: "Description",
      loadingDeviceInfo: "Loading device info...",
      noDeviceAssigned: "No device assigned",
      assignDeviceDescription:
        "Assign a device to monitor soil moisture and automate watering schedules",
      assignDevice: "Assign Device",
      wateringHistory: "Watering History",
      wateringHistoryDescription:
        "View watering data and trends for this location",
      viewWateringHistory: "View Watering History",
      availableDevices: "Available Devices",
      noDevicesAvailableDescription:
        "All devices are currently assigned or there are no devices registered.",
      loadingLocation: "Loading location details...",
      lessThanOneMonth: "< 1 month",
      acres: "acres",
      trees: "trees",
      year: "year",
      month: "month",
      months: "months",

      //location list
      loadingLocations: "Loading locations...",
      failedToLoadLocations:
        "Failed to load locations. Please try again later.",
      noLocationsFound: "No Locations Found",
      noLocationsDescription:
        "You haven't added any coconut farm locations yet.",
      addFirstLocation: "Add Your First Location",
      deviceAttached: "Device attached",
      noDevice: "No device",
    },

    watering: {
      wateringHistory: "Watering History",
      loadingHistory: "Loading watering history...",
      failedToLoadHistory:
        "Failed to load watering history. Please try again later.",
      timeRange: "Time Range",
      week: "Week",
      month: "Month",
      year: "Year",
      start: "Start",
      end: "End",
      summary: "Summary",
      totalWater: "Total Water (L)",
      avgPerSchedule: "Avg Per Schedule (L)",
      totalSchedules: "Total Schedules",
      completed: "Completed",
      wateringTrends: "Watering Trends",
      amount: "Amount",
      efficiency: "Efficiency",
      frequency: "Frequency",
      waterAmountChart: "Water Amount (L)",
      efficiencyChart: "Watering Efficiency (%)",
      frequencyChart: "Watering Frequency",
      noWateringData: "No Watering Data",
      noWateringDataDescription:
        "There are no watering schedules for this location in the selected time range.",
    },

    schedule: {
      noLocations: "No Locations",
      createLocationPrompt:
        "You need to create a location before creating a watering schedule. Would you like to create one now?",
      createLocation: "Create Location",
      failedToLoadLocations:
        "Failed to load locations. Please try again later.",
      pleaseSelectLocation: "Please select a location",
      noLocationSelected: "No location selected",
      scheduleCreated: "Watering schedule created successfully",
      failedToCreateSchedule:
        "Failed to create watering schedule. Please try again.",
      loadingLocations: "Loading locations...",
      selectLocation: "Select Location",
      selectALocation: "Select a location",
      timing: "Timing",
      scheduleForNow: "Schedule for now",
      scheduleForLater: "Schedule for later",
      notesOptional: "Notes (Optional)",
      notesPlaceholder: "Add any notes about this watering schedule...",
      createSchedule: "Create Schedule",
      noLocationsFound: "No locations found",
      noLocationsDescription:
        "You need to create a location before creating a watering schedule",
      createNewLocation: "Create New Location",

      // Schedule detail specific translations
      loadingSchedule: "Loading schedule details...",
      scheduleNotFound: "Schedule Not Found",
      scheduleNotFoundDescription:
        "The watering schedule could not be found or has been deleted.",
      failedToLoadSchedule:
        "Failed to load schedule details. Please try again later.",
      failedToUpdateStatus:
        "Failed to update schedule status. Please try again.",
      executionDetails: "Execution Details",
      waterUsed: "Water Used",
      liters: "liters",
      startTime: "Start Time",
      endTime: "End Time",
      duration: "Duration",
      minutes: "minutes",
      executedBy: "Executed By",
      automaticSystem: "Automatic System",
      manual: "Manual",
      relatedResources: "Related Resources",
      viewLocation: "View Location",
      locationDetails: "Location details",
      optimalEfficiency: "Optimal watering efficiency",
      overwatered: "Overwatered by {{percentage}}%",
      underwatered: "Underwatered by {{percentage}}%",
      wateringSchedules: "Watering Schedules",
      scheduleDetails: "Schedule Details",
      scheduleHistory: "Schedule History",
    },

    history: {
      setDateRange: "Set Date Range",
      chooseDateRange: "Choose date range",
      lastTwoWeeks: "Last 2 Weeks",
      lastMonth: "Last Month",
      custom: "Custom",
      loadingSchedules: "Loading schedules...",
      noSchedulesFound: "No Schedules Found",
      noSchedulesToday: "You don't have any watering schedules for today.",
      noSchedulesThisWeek:
        "You don't have any watering schedules for this week.",
      noSchedulesThisMonth:
        "You don't have any watering schedules for this month.",
      noSchedulesSelected:
        "No watering schedules found for the selected period.",
      createNewSchedule: "Create New Schedule",
      completed: "completed",
      pending: "pending",
      skipped: "skipped",
      today: "Today",
      thisWeek: "This Week",
      thisMonth: "This Month",
      customRange: "Custom Range",
      schedulesFound: "{{count}} schedules found",
      customDateFilterApplied: "Custom date filter applied",
    },

    main: {
      todaysWatering: "Today's Watering",
      upcoming: "Upcoming",
      loadingSchedules: "Loading watering schedules...",
      noWateringToday: "No watering scheduled today",
      noWateringTodayDescription:
        "You don't have any watering tasks scheduled for today.",
      createWateringSchedule: "Create Watering Schedule",
      createNewSchedule: "Create New Schedule",
      noUpcomingSchedules: "No upcoming schedules",
      upcomingSchedulesCount: "Upcoming Schedules ({{count}})",
      viewAll: "View All ({{count}})",
      pending: "pending",
      completed: "completed",
      litersUsed: "liters used",
    },

    devices: {
      // General device section translations
      deviceList: "Devices",
      deviceDetails: "Device Details",
      registerDevice: "Register Device",
      editDevice: "Edit Device",
      addDevice: "Add Device",
      noDevices: "No Devices Found",
      addFirstDevice: "Register Your First Device",
      noDevicesDescription: "You haven't registered any devices yet.",

      // Device properties
      deviceType: "Device Type",
      status: "Status",
      batteryLevel: "Battery Level",
      lastUpdated: "Last Updated",
      deviceId: "Device ID",
      firmware: "Firmware",
      readingInterval: "Reading Interval",
      reportingInterval: "Reporting Interval",
      locationAssignment: "Location Assignment",

      // Device status actions
      maintainDevice: "Maintain Device",
      deactivateDevice: "Deactivate Device",
      activateDevice: "Activate Device",
      deleteDevice: "Delete Device",
      markAsMaintenance: "Mark as Maintenance",
      markAsInactive: "Mark as Inactive",
      markAsActive: "Mark as Active",
      reactivateDevice: "Reactivate Device",

      // Device readings
      currentReadings: "Current Readings",
      lastReading: "Last Reading",
      lastUpdatedAt: "Last updated: {{time}}",
      moistureReadings: "Moisture Readings",

      // Location assignment
      assignedToLocation: "Assigned to: {{location}}",
      notAssignedToLocation: "Not assigned to any location",
      assignInLocationDetails:
        "Assign this device to a location from the location details screen",
      unassignedToChange:
        "This device is assigned to a location. Unassign it to change status.",

      // Device types
      soilSensor: "Soil Sensor",
      weatherStation: "Weather Station",
      irrigationController: "Irrigation Controller",
      moistureSensor: "Moisture Sensor",

      // Form fields and placeholders
      deviceInformation: "Device Information",
      deviceIdPlaceholder: "e.g., DEV001",
      firmwarePlaceholder: "e.g., 1.0.0",
      statusActive: "Active",
      statusInactive: "Inactive",
      selectDeviceType: "Select Device Type",
      updateDevice: "Update Device",

      // Time and measurements
      minutesUnit: "minutes",

      // Success/error messages
      deviceRegistered: "Device registered successfully!",
      deviceDeleted: "Device deleted successfully",
      deviceUpdated: "Device updated successfully",
      deviceNotFound: "Device not found",
      statusUpdated: "Device status updated to {{status}}",

      // Loading states
      loadingDevice: "Loading device data...",
      loadingDevices: "Loading devices...",

      // Error messages
      failedToLoad: "Failed to load device data",
      failedToLoadDevices: "Failed to load devices. Please try again later.",
      failedToUpdate: "Failed to update device",
      failedToRegister: "Failed to register device. Please try again.",

      // Confirmation dialogs
      confirmStatusChange: "Change device status",
      statusChangeMessage:
        "Are you sure you want to change this device status?",
      cannotChangeStatus: "Cannot Change Status",
      deviceAssignedWarning:
        "This device is currently assigned to a location. Please unassign it first before changing to inactive or maintenance status.",
      deleteConfirmation: "Are you sure you want to delete this device?",
      deleteWarning: "All associated data will be permanently deleted",
      deleteDeviceTitle: "Delete Device",
      deleteDeviceConfirm:
        "Are you sure you want to delete this device? This action cannot be undone.",
      deleteDeviceWarning: "All associated data will be permanently deleted.",

      // Validation messages
      deviceIdRequired: "Device ID is required",
      deviceIdMinLength: "Device ID must be at least 3 characters",
      firmwareRequired: "Firmware version is required",
      readingIntervalNumber: "Reading interval must be a number",
      readingIntervalRange:
        "Reading interval must be between 1 and 1440 minutes",
      reportingIntervalNumber: "Reporting interval must be a number",
      reportingIntervalRange:
        "Reporting interval must be between 1 and 1440 minutes",
      moistureThresholdRange: "Moisture threshold must be between 0 and 100",
      temperatureThresholdRange:
        "Temperature threshold must be between -50 and 100°C",
      humidityThresholdRange: "Humidity threshold must be between 0 and 100%",
    },
  },

  copra: {
    // Navigation screens
    createReading: "Create Reading",
    batchHistory: "Batch History",
    allBatches: "All Batches",
    updateReading: "Update Reading",
    moistureGraph: "Moisture Graph",
    dryingRecommendations: "Drying Recommendations",

    // AllBatchesScreen
    noBatchesFound: "No Batches Found",
    createBatchPrompt:
      "Create a new batch to start tracking your copra drying process",
    createNewBatch: "Create New Batch",
    batchLabel: "Batch {{id}}",
    statusActive: "Active",
    statusDrying: "Drying",
    statusComplete: "Complete",
    readings: "Readings",
    updated: "Updated",
    copraBatches: "Copra Batches",
    activeBatches: "{{count}} Active Batches",
    loadingBatches: "Loading batches...",
    daysAgo: "{{count}} day ago",
    hoursAgo: "{{count}} hour{{count, plural, one{} other{s}}} ago",
    justNow: "Just now",

    // BatchHistoryScreen
    failedToFetchHistory: "Failed to fetch batch history",
    confirmDelete: "Confirm Delete",
    deleteRecordConfirmation:
      "Are you sure you want to delete this record? This action cannot be undone.",
    recordDeletedSuccess: "Record deleted successfully",
    failedToDeleteRecord: "Failed to delete the record. Please try again.",
    deleteEntireBatch: "Delete Entire Batch",
    deleteBatchConfirmation:
      "Are you sure you want to delete this entire batch? All readings will be permanently removed. This action cannot be undone.",
    deleteBatch: "Delete Batch",
    batchDeletedSuccess: "Batch deleted successfully",
    failedToDeleteBatch: "Failed to delete the batch. Please try again.",
    notEnoughData: "Not Enough Data",
    needMoreReadings:
      "You need at least 2 readings to generate a meaningful graph. Please add more readings.",
    generateGraph: "Generate Graph",
    moisture: "Moisture",
    dryingTime: "Drying Time",
    oilYield: "Oil Yield (10kg)",
    temperature: "Temperature",
    humidity: "Humidity",
    start: "Start",
    expectedEnd: "Expected End",

    // CreateReadingScreen
    permissionDenied: "Permission denied",
    locationPermissionRequired:
      "Location permission is required for weather data",
    failedToFetchDevices: "Failed to fetch devices",
    couldNotRetrieveMoisture: "Could not retrieve moisture reading from device",
    validationError: "Validation Error",
    fillRequiredFields: "Please fill in all required fields",
    locationNotAvailable: "Location data is not available",
    selectMoistureSensor: "Select Moisture Sensor",
    noMoistureSensorsFound: "No moisture sensors found",
    viewAllBatches: "View All Batches",
    newCopraReading: "New Copra Reading",
    batchId: "Batch ID",
    enterBatchId: "Enter Batch ID",
    deviceId: "Device ID",
    moistureLevel: "Moisture Level",
    fetchingFromDevice: "Fetching from device...",
    enterMoistureLevel: "Enter Moisture Level",
    dataFetchedFromDevice: "Data fetched from device",
    readyForProcessing:
      "Moisture level ≤ 7: Ready for processing (drying time: 0 hours)",
    currentStatus: "Current Status",
    notes: "Notes",
    enterNotes: "Enter Notes",
    readyForProcessingTitle: "Ready for Processing",
    predictedDryingTime: "Predicted Drying Time",
    zeroHours: "0 hours",
    hoursValue: "{{hours}} hours",
    failedToCreateReading: "Failed to create reading. Please try again.",
    saveReading: "Save Reading",
    predictDryingTime: "Predict Drying Time",
    soilSensor: "Soil Sensor",
    moistureSensor: "Moisture Sensor",

    // MoistureGraphScreen
    moistureTrendAnalysis: "Moisture Trend Analysis",
    trackingMoistureLevels:
      "Tracking moisture levels over time for batch #{{id}}",
    moistureLevelTrend: "Moisture Level Trend",
    greenLinesIndicate: "Green lines indicate optimal moisture range (6-8%)",
    targetMoistureSettings: "Target Moisture Settings",
    targetMoisture: "Target Moisture",
    dryingProjections: "Drying Projections",
    currentMoisture: "Current Moisture",
    moistureToLose: "Moisture to Lose",
    noReadingsAvailable: "No readings available",
    projected: "Projected",
    minOptimal: "Min Optimal",
    maxOptimal: "Max Optimal",
    noRecommendationsNeeded: "No Recommendations Needed",
    batchAlreadyDried:
      "This batch is already sufficiently dried and doesn't require further drying recommendations.",

    // UpdateReadingScreen
    updateReadingNotes: "Update Reading Notes",
    noteUpdatedSuccess: "Note updated successfully",
    failedToUpdateNote: "Failed to update note. Please try again.",
    addReadingNotes: "Add notes about this reading...",
    statusText: "status",

    // Status messages
    status: {
      too_wet: "TOO WET",
      wet: "WET",
      optimal: "OPTIMAL",
      dry: "DRY",
      too_dry: "TOO DRY",
      default: "UNKNOWN",
      newly_harvested: "Newly Harvested",
      moderate_level: "Moderate Moisture",
      dryed: "Dried",
      over_dryed: "Over Dried",
    },

    // DryingRecommendationsScreen
    optimizedForBatch:
      "Optimized for batch #{{id}} based on current conditions",
    weather: "Weather",
    dryingStatus: "Drying Status",
    qualityReminders: "Quality Reminders",
    returnToMoistureGraph: "Return to Moisture Graph",

    // Quality Reminders
    reminder1: "• Proper drying is critical for oil quality and yield",
    reminder2: "• Target moisture 6-8% for optimal oil extraction",
    reminder3: "• Avoid over-drying as it can reduce oil yields",
    reminder4: "• Protect from contamination during the drying process",
    reminder5: "• Monitor for any signs of mold or pests",

    // Recommendations for newly harvested
    recommendations: {
      initialDryingSetup: {
        title: "Initial Drying Setup",
        description:
          "Spread the copra evenly on drying mats or platforms in a single layer to maximize exposure.",
      },
      airCirculation: {
        title: "Air Circulation",
        description:
          "Ensure adequate ventilation to accelerate the initial high-moisture evaporation phase.",
      },
      sunExposure: {
        title: "Sun Exposure",
        highHumidity:
          "Due to high humidity, increase drying time and use artificial heat sources if available.",
        normal:
          "Direct sunlight is optimal for newly harvested copra. Aim for 6-8 hours of sun exposure daily.",
      },
      firstTurn: {
        title: "First Turn",
        description:
          "Turn the copra after 4-5 hours to ensure even drying on all surfaces.",
      },
      protection: {
        title: "Protection",
        description:
          "Cover the copra during night time or unexpected rainfall to prevent moisture reabsorption.",
      },

      // Recommendations for moderate level
      controlledDrying: {
        title: "Controlled Drying",
        lowTemperature:
          "Current temperatures are lower than optimal. Consider using kiln drying to supplement natural drying.",
        normal:
          "Maintain consistent drying conditions. The rate of moisture loss slows at this stage.",
      },
      regularTurning: {
        title: "Regular Turning",
        description:
          "Turn the copra every 2-3 hours to prevent uneven drying and potential mold growth in pockets of higher moisture.",
      },
      moistureMonitoring: {
        title: "Moisture Monitoring",
        description:
          "Check moisture levels twice daily. The optimal target range is 6-8%.",
      },
      spatialArrangement: {
        title: "Spatial Arrangement",
        description:
          "Rearrange copra to ensure pieces from the center are moved to the edges and vice versa.",
      },
      heatManagement: {
        title: "Heat Management",
        highHumidity:
          "With high humidity conditions, consider extending drying time and using fans to improve air circulation.",
        normal:
          "Optimal drying temperature is between 30-35°C (86-95°F). Higher temperatures may cause quality loss.",
      },
    },
  },
  customWatering: {
    // Action buttons
    markAsCompleted: "Mark as Completed",
    skipWatering: "Skip Watering",

    // Complete modal
    completeWateringTask: "Complete Watering Task",
    markWateringCompleted: "Mark this watering task as completed?",
    actualAmountUsed: "Actual amount used:",
    liters: "liters",
    additionalNotes: "Additional notes (optional):",
    notesPlaceholder: "E.g., Used drip irrigation method",
    cancel: "Cancel",
    confirmCompletion: "Confirm Completion",
    successCompleted: "Watering schedule marked as completed",
    failedToComplete:
      "Failed to mark schedule as completed. Please try again later.",

    // Skip modal
    skipWateringTask: "Skip Watering Task",
    skipThisTask: "Skip this watering task?",
    reasonForSkipping: "Reason for skipping:",
    recentRainfall: "Recent rainfall",
    alreadyWateredManually: "Already watered manually",
    equipmentUnavailable: "Equipment unavailable",
    soilMoistureAdequate: "Soil moisture adequate",
    otherReason: "Other reason",
    pleaseSpecifyReason: "Please specify the reason",
    confirmSkip: "Confirm Skip",
    successSkipped: "Watering schedule marked as skipped",
    failedToSkip: "Failed to skip schedule. Please try again later.",
  },

  scheduleCalendar: {
    wateringCalendar: "Watering Calendar",
    today: "Today",
    noSchedulesFound: "No schedules found",
    noWateringSchedulesFor: "No watering schedules for {{date}}",
    selectDateToView: "Select a date to view schedules",
  },

  scheduleCard: {
    location: "Location",
    litersUsed: "{{actual}}/{{recommended}} liters used",
    liters: "{{amount}} liters",
    viewDetails: "View Details",
    waterNeedCategories: {
      high: "High",
      moderate: "Moderate",
      low: "Low",
      none: "None",
    },
  },

  soilConditions: {
    title: "Soil Conditions",
    soilType: "Soil Type",
    plantAge: "Plant Age",
    year: "year",
    years: "years",
    moisture: {
      tooDry: "Too Dry",
      dry: "Dry",
      optimal: "Optimal",
      moist: "Moist",
      veryMoist: "Very Moist",
    },
    soilTypes: {
      lateritic: "Lateritic",
      sandyLoam: "Sandy Loam",
      cinnamonSand: "Cinnamon Sand",
      redYellowPodzolic: "Red Yellow Podzolic",
      alluvial: "Alluvial",
    },
  },

  waterNeedChart: {
    title: "Recommended Water",
    mlModelConfidence: "ML model confidence: {{confidence}}%",
    recommendations: {
      noWatering: "No watering needed at this time.",
      lightWatering: "Light watering recommended.",
      moderateWatering: "Moderate watering recommended.",
      fullWatering: "Full watering recommended.",
    },
  },

  weatherConditions: {
    title: "Weather Conditions",
    asOf: "as of {{dateTime}}",
    temperature: "Temperature",
    humidity: "Humidity",
    rainfall: "Rainfall",
    rainfallLabels: {
      none: "None",
      light: "Light",
      moderate: "Moderate",
      heavy: "Heavy",
    },
    summaries: {
      rainfallDetected:
        "Rainfall of {{amount}}mm detected. Adjust watering accordingly.",
      hotAndDry: "Hot and dry conditions. Plants may need additional water.",
      coolAndHumid:
        "Cool and humid conditions. Reduced watering may be sufficient.",
      highHumidity: "High humidity may reduce plant water needs.",
      regular: "Regular watering recommended based on soil conditions.",
    },
  },
  home: {
    home: "Home",
    welcomeBack: "Welcome back",
    smartFarmManagement: "Smart Farm Management",
    monitorFarm: "Monitor your coconut farm from anywhere",
    copraClassification: "Copra Classification",
    dataInsights: "Get data-driven insights for better results",
    weatherIntegration: "Weather Integration",
    optimizeIrrigation: "Optimize irrigation based on forecasts",
    remoteControl: "Remote Control",
    automateIrrigation: "Automate irrigation and fertilization",
    waterScheduling: "Water Scheduling",
    coconutYield: "Coconut Yield",
    copraIdentification: "Copra Identification",
    dryingTime: "Drying Time in Copra",
    locations: "Locations",
    devices: "Devices",
    account: "Account",
    settings: "Settings",
    selectLanguage: "Select Language",
    signOut: "Sign Out",
    signOutTitle: "Sign Out",
    signOutConfirmation: "Are you sure you want to sign out?"
  },

  account: {
    email: "Email Address",
    phoneNumber: "Phone Number",
    accountStatus: "Account Status",
    active: "Active",
    inactive: "Inactive",
    editProfile: "Edit Profile",
    enterPhoneNumber: "Enter phone number",
    updateProfile: "Update Profile",
    notProvided: "Not provided"
  }


};
