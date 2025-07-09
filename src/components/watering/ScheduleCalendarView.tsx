// import React, { useState, useEffect } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   TouchableOpacity, 
//   FlatList,
//   ViewStyle,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { WateringSchedule } from '../../types';
// import { colors } from '../../constants/colors';
// import { groupSchedulesByDate } from '../../utils/wateringHelpers';
// import Card from '../common/Card';
// import ScheduleCard from './ScheduleCard';

// interface ScheduleCalendarViewProps {
//   schedules: WateringSchedule[];
//   onSchedulePress: (schedule: WateringSchedule) => void;
//   containerStyle?: ViewStyle;
// }

// const ScheduleCalendarView: React.FC<ScheduleCalendarViewProps> = ({
//   schedules,
//   onSchedulePress,
//   containerStyle,
// }) => {
//   const [selectedDate, setSelectedDate] = useState<string>('');
//   const [groupedSchedules, setGroupedSchedules] = useState<{[key: string]: WateringSchedule[]}>(
//     {}
//   );
//   const [calendarDates, setCalendarDates] = useState<string[]>([]);

//   useEffect(() => {
//     const grouped = groupSchedulesByDate(schedules);
//     setGroupedSchedules(grouped);
    
//     // Get all dates and sort them
//     const dates = Object.keys(grouped).sort();
//     setCalendarDates(dates);
    
//     // Default to today or the first date with schedules
//     const today = new Date().toISOString().split('T')[0];
//     if (dates.includes(today)) {
//       setSelectedDate(today);
//     } else if (dates.length > 0) {
//       setSelectedDate(dates[0]);
//     }
//   }, [schedules]);

//   const renderDateItem = ({ item }: { item: string }) => {
//     const date = new Date(item);
//     const isSelected = item === selectedDate;
//     const hasSchedules = groupedSchedules[item] && groupedSchedules[item].length > 0;
//     const hasPending = hasSchedules && groupedSchedules[item].some(s => s.status === 'pending');
    
//     return (
//       <TouchableOpacity
//         style={[
//           styles.dateItem,
//           isSelected && styles.selectedDateItem,
//         ]}
//         onPress={() => setSelectedDate(item)}
//       >
//         <Text style={[styles.dateDayText, isSelected && styles.selectedDateText]}>
//           {date.toLocaleDateString('en-US', { weekday: 'short' })}
//         </Text>
//         <View 
//           style={[
//             styles.dateNumberContainer,
//             isSelected && styles.selectedDateNumberContainer,
//             hasPending && styles.pendingDateContainer,
//           ]}
//         >
//           <Text 
//             style={[
//               styles.dateNumberText, 
//               isSelected && styles.selectedDateNumber,
//               hasPending && styles.pendingDateNumber,
//             ]}
//           >
//             {date.getDate()}
//           </Text>
//         </View>
//         <Text style={[styles.dateMonthText, isSelected && styles.selectedDateText]}>
//           {date.toLocaleDateString('en-US', { month: 'short' })}
//         </Text>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View style={[styles.container, containerStyle]}>
//       {/* Calendar header */}
//       <View style={styles.calendarHeader}>
//         <Text style={styles.calendarTitle}>Watering Calendar</Text>
//         <TouchableOpacity style={styles.todayButton}>
//           <Text style={styles.todayButtonText}>Today</Text>
//           <Ionicons name="calendar-outline" size={18} color={colors.primary} />
//         </TouchableOpacity>
//       </View>
      
//       {/* Calendar date selector */}
//       <View style={styles.calendarContainer}>
//         <FlatList
//           data={calendarDates}
//           renderItem={renderDateItem}
//           keyExtractor={(item) => item}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.datesList}
//         />
//       </View>
      
//       {/* Schedules for selected date */}
//       <View style={styles.schedulesContainer}>
//         {selectedDate && groupedSchedules[selectedDate]?.length > 0 ? (
//           <>
//             <Text style={styles.selectedDateTitle}>
//               {new Date(selectedDate).toLocaleDateString('en-US', {
//                 weekday: 'long',
//                 month: 'long',
//                 day: 'numeric',
//               })}
//             </Text>
            
//             {groupedSchedules[selectedDate].map((schedule) => (
//               <ScheduleCard
//                 key={schedule._id}
//                 schedule={schedule}
//                 onPress={() => onSchedulePress(schedule)}
//                 showDetails={true}
//                 style={styles.scheduleCard}
//               />
//             ))}
//           </>
//         ) : (
//           <Card style={styles.emptyContainer} variant="flat">
//             <Ionicons name="water-outline" size={48} color={colors.gray300} />
//             <Text style={styles.emptyTitle}>
//               No schedules found
//             </Text>
//             <Text style={styles.emptyText}>
//               {selectedDate 
//                 ? `No watering schedules for ${new Date(selectedDate).toLocaleDateString()}`
//                 : 'Select a date to view schedules'
//               }
//             </Text>
//           </Card>
//         )}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   calendarHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   calendarTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: colors.textPrimary,
//   },
//   todayButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 6,
//   },
//   todayButtonText: {
//     fontSize: 14,
//     color: colors.primary,
//     marginRight: 4,
//   },
//   calendarContainer: {
//     marginBottom: 16,
//   },
//   datesList: {
//     paddingVertical: 8,
//   },
//   dateItem: {
//     alignItems: 'center',
//     marginRight: 12,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 8,
//   },
//   selectedDateItem: {
//     backgroundColor: colors.primary + '10',
//   },
//   dateDayText: {
//     fontSize: 12,
//     color: colors.textSecondary,
//     marginBottom: 4,
//   },
//   dateNumberContainer: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   selectedDateNumberContainer: {
//     backgroundColor: colors.primary,
//   },
//   pendingDateContainer: {
//     backgroundColor: colors.warning,
//   },
//   dateNumberText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: colors.textPrimary,
//   },
//   selectedDateNumber: {
//     color: colors.white,
//   },
//   pendingDateNumber: {
//     color: colors.white,
//   },
//   dateMonthText: {
//     fontSize: 12,
//     color: colors.textSecondary,
//   },
//   selectedDateText: {
//     color: colors.primary,
//     fontWeight: '500',
//   },
//   schedulesContainer: {
//     flex: 1,
//   },
//   selectedDateTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: colors.textPrimary,
//     marginBottom: 12,
//   },
//   scheduleCard: {
//     marginBottom: 12,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40,
//   },
//   emptyTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: colors.textPrimary,
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptyText: {
//     fontSize: 14,
//     color: colors.textSecondary,
//     textAlign: 'center',
//   },
// });

// export default ScheduleCalendarView;

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WateringSchedule } from '../../types';
import { colors } from '../../constants/colors';
import { groupSchedulesByDate } from '../../utils/wateringHelpers';
import Card from '../common/Card';
import ScheduleCard from './ScheduleCard';
import { useTranslation } from 'react-i18next'; // Import useTranslation hook

interface ScheduleCalendarViewProps {
  schedules: WateringSchedule[];
  onSchedulePress: (schedule: WateringSchedule) => void;
  containerStyle?: ViewStyle;
}

const ScheduleCalendarView: React.FC<ScheduleCalendarViewProps> = ({
  schedules,
  onSchedulePress,
  containerStyle,
}) => {
  // Initialize translation hook
  const { t, i18n } = useTranslation();
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [groupedSchedules, setGroupedSchedules] = useState<{[key: string]: WateringSchedule[]}>(
    {}
  );
  const [calendarDates, setCalendarDates] = useState<string[]>([]);

  useEffect(() => {
    const grouped = groupSchedulesByDate(schedules);
    setGroupedSchedules(grouped);
    
    // Get all dates and sort them
    const dates = Object.keys(grouped).sort();
    setCalendarDates(dates);
    
    // Default to today or the first date with schedules
    const today = new Date().toISOString().split('T')[0];
    if (dates.includes(today)) {
      setSelectedDate(today);
    } else if (dates.length > 0) {
      setSelectedDate(dates[0]);
    }
  }, [schedules]);

  // Function to handle going to today's date
  const goToToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  };
  
  // Get appropriate locale based on current language
  const getCurrentLocale = () => {
    const language = i18n.language;
    switch (language) {
      case 'ta':
        return 'ta-IN'; // Tamil locale
      case 'si':
        return 'si-LK'; // Sinhala locale
      default:
        return 'en-US'; // Default to English locale
    }
  };

  const renderDateItem = ({ item }: { item: string }) => {
    const date = new Date(item);
    const isSelected = item === selectedDate;
    const hasSchedules = groupedSchedules[item] && groupedSchedules[item].length > 0;
    const hasPending = hasSchedules && groupedSchedules[item].some(s => s.status === 'pending');
    
    // Get current locale
    const locale = getCurrentLocale();
    
    return (
      <TouchableOpacity
        style={[
          styles.dateItem,
          isSelected && styles.selectedDateItem,
        ]}
        onPress={() => setSelectedDate(item)}
      >
        <Text style={[styles.dateDayText, isSelected && styles.selectedDateText]}>
          {date.toLocaleDateString(locale, { weekday: 'short' })}
        </Text>
        <View 
          style={[
            styles.dateNumberContainer,
            isSelected && styles.selectedDateNumberContainer,
            hasPending && styles.pendingDateContainer,
          ]}
        >
          <Text 
            style={[
              styles.dateNumberText, 
              isSelected && styles.selectedDateNumber,
              hasPending && styles.pendingDateNumber,
            ]}
          >
            {date.getDate()}
          </Text>
        </View>
        <Text style={[styles.dateMonthText, isSelected && styles.selectedDateText]}>
          {date.toLocaleDateString(locale, { month: 'short' })}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Calendar header */}
      <View style={styles.calendarHeader}>
        <Text style={styles.calendarTitle}>{t('scheduleCalendar.wateringCalendar')}</Text>
        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayButtonText}>{t('scheduleCalendar.today')}</Text>
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Calendar date selector */}
      <View style={styles.calendarContainer}>
        <FlatList
          data={calendarDates}
          renderItem={renderDateItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.datesList}
        />
      </View>
      
      {/* Schedules for selected date */}
      <View style={styles.schedulesContainer}>
        {selectedDate && groupedSchedules[selectedDate]?.length > 0 ? (
          <>
            <Text style={styles.selectedDateTitle}>
              {new Date(selectedDate).toLocaleDateString(getCurrentLocale(), {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            
            {groupedSchedules[selectedDate].map((schedule) => (
              <ScheduleCard
                key={schedule._id}
                schedule={schedule}
                onPress={() => onSchedulePress(schedule)}
                showDetails={true}
                style={styles.scheduleCard}
              />
            ))}
          </>
        ) : (
          <Card style={styles.emptyContainer} variant="flat">
            <Ionicons name="water-outline" size={48} color={colors.gray300} />
            <Text style={styles.emptyTitle}>
              {t('scheduleCalendar.noSchedulesFound')}
            </Text>
            <Text style={styles.emptyText}>
              {selectedDate 
                ? t('scheduleCalendar.noWateringSchedulesFor', { 
                    date: new Date(selectedDate).toLocaleDateString(getCurrentLocale()) 
                  })
                : t('scheduleCalendar.selectDateToView')
              }
            </Text>
          </Card>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  todayButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
  },
  calendarContainer: {
    marginBottom: 16,
  },
  datesList: {
    paddingVertical: 8,
  },
  dateItem: {
    alignItems: 'center',
    marginRight: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  selectedDateItem: {
    backgroundColor: colors.primary + '10',
  },
  dateDayText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dateNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  selectedDateNumberContainer: {
    backgroundColor: colors.primary,
  },
  pendingDateContainer: {
    backgroundColor: colors.warning,
  },
  dateNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  selectedDateNumber: {
    color: colors.white,
  },
  pendingDateNumber: {
    color: colors.white,
  },
  dateMonthText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  selectedDateText: {
    color: colors.primary,
    fontWeight: '500',
  },
  schedulesContainer: {
    flex: 1,
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  scheduleCard: {
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default ScheduleCalendarView;