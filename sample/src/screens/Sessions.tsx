import {
    ActivityIndicator,
    Image,
    Platform,
    PlatformColor,
    Pressable,
    SectionList,
    StyleSheet,
    Text,
    Alert,
    View
} from 'react-native'

import {useEffect} from 'react'
import {useLazyQuery, useQuery} from "@apollo/client/react";
import {
    GetSessionContentDocument,
    GetSessionsDocument,
    WorkoutFormat,
    WorkoutPreviewItemFragment
} from "../../graphql/types.ts";
import {addWorkoutListener, launchWorkout as launchTrainingKit} from 'trainingkit-reactnative'

interface Section {
    title: string;
    data: WorkoutPreviewItemFragment[];
}

function formatDuration(seconds: number): string {
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes.toString() + ' min'
}


function SessionsScreen() {
    const  { data, loading, error } = useQuery(GetSessionsDocument)

    // Handle completion: react when a workout is saved or quit.
    useEffect(() => {
        const subscription = addWorkoutListener({
            onSave: (workout) => Alert.alert('Séance enregistrée', `${Object.keys(workout).length} champs`),
            onQuit: () => Alert.alert('Séance quittée'),
        })
        return () => subscription.remove()
    }, [])

    const sessionsData: Section[] = [
        {
            title: "Séances classiques",
            data: data?.publicWorkouts.edges
                .filter( edge => edge.node.format == WorkoutFormat.Classic)
                .map(edge => edge.node as WorkoutPreviewItemFragment) ?? []
        },
        {
            title: "Séances en streaming",
            data: data?.publicWorkouts.edges
                .filter( edge => edge.node.format == WorkoutFormat.Play)
                .map(edge => edge.node as WorkoutPreviewItemFragment) ?? []
        }
    ]

    const [fetchSessionContent] = useLazyQuery(GetSessionContentDocument)

    function launchWorkout(identifier: string) {
        fetchSessionContent({ variables: { id: identifier } })
            // eslint-disable-next-line @typescript-eslint/no-shadow
            .then(({ data }) => {
                const session = data?.publicWorkoutSession
                if (session) {
                    launchTrainingKit(session)
                }
            })
            .catch((err) => {
                Alert.alert('Erreur', err.message)
            })
    }

    const renderSectionHeader = ({ section }: { section: Section }) => (
        <View style={styles.sectionHeader}>
            <Text
                style={{
                    fontSize: 16,
                    fontWeight: '500',
                    ...Platform.select({
                        ios: {
                            color: PlatformColor('secondaryLabel'),
                        },
                        android: {
                            color: PlatformColor('?attr/sampleSecondaryTextColor'),
                        },
                        default: { color: '#666666' },
                    }),
                }}
            >
                {section.title}
            </Text>
        </View>
    );

    const renderItem = ({ item }: { item: WorkoutPreviewItemFragment }) => (
        <Pressable onPress={ () => launchWorkout(item.id)}>
            <View style={styles.cell}>
                <Image source={{ uri: item.picture }} style={styles.cellImage} contentFit="cover" />
                <View style={styles.cellContent}>
                    <Text
                        style={{
                            fontSize: 17,
                            fontWeight: 'bold',
                            ...Platform.select({
                                ios: {
                                    color: PlatformColor('label'),
                                },
                                android: {
                                    color: PlatformColor('?attr/samplePrimaryTextColor'),
                                },
                                default: { color: '#111111' },
                            }),
                        }}
                    >
                        {item.name}
                    </Text>
                    <Text
                        style={{
                            fontSize: 15,
                            marginTop: 4,
                            ...Platform.select({
                                ios: {
                                    color: PlatformColor('secondaryLabel'),
                                },
                                android: {
                                    color: PlatformColor('?attr/sampleSecondaryTextColor'),
                                },
                                default: { color: '#666666' },
                            }),
                        }}
                    >
                        {formatDuration(item.duration)}
                    </Text>
                </View>
            </View>
        </Pressable>
    );

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    return (
        <SectionList
            sections={sessionsData}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={false}
        />
    )
}

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        ...Platform.select({
            ios: {
                backgroundColor: PlatformColor('systemBackground'),
            },
            android: {
                backgroundColor: PlatformColor('?attr/sampleBackgroundColor'),
            },
            default: {
                backgroundColor: '#FFFFFF',
            },
        }),
    },
    listContent: {
        ...Platform.select({
            ios: {
                backgroundColor: PlatformColor('systemBackground'),
            },
            android: {
                backgroundColor: PlatformColor('?attr/sampleBackgroundColor'),
            },
            default: {
                backgroundColor: '#FFFFFF',
            },
        }),
    },
    sectionHeader: {
        paddingHorizontal: 36,
        paddingBottom: 8,
        paddingTop: 20,
    },
    cell: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 16,
        ...Platform.select({
            ios: {
                backgroundColor: PlatformColor('secondarySystemGroupedBackground') as any,
            },
            android: {
                backgroundColor: PlatformColor('?attr/sampleSurfaceColor'),
            },
            default: { backgroundColor: '#FFFFFF' },
        }),
    },
    cellImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 16,
    },
    cellContent: {
        flex: 1,
    },
});


export default SessionsScreen
