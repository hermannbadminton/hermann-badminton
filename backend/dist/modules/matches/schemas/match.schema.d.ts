import { Document } from 'mongoose';
import { MatchStatus } from '../../../common/enums/tournament-status.enum';
export type MatchDocument = Match & Document;
export declare class SetScore {
    setNumber: number;
    team1Score: number;
    team2Score: number;
    winnerTeamId?: string;
}
export declare const SetScoreSchema: import("mongoose").Schema<SetScore, import("mongoose").Model<SetScore, any, any, any, any, any, SetScore>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SetScore, Document<unknown, {}, SetScore, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<SetScore & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    setNumber?: import("mongoose").SchemaDefinitionProperty<number, SetScore, Document<unknown, {}, SetScore, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SetScore & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    team1Score?: import("mongoose").SchemaDefinitionProperty<number, SetScore, Document<unknown, {}, SetScore, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SetScore & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    team2Score?: import("mongoose").SchemaDefinitionProperty<number, SetScore, Document<unknown, {}, SetScore, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SetScore & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    winnerTeamId?: import("mongoose").SchemaDefinitionProperty<string, SetScore, Document<unknown, {}, SetScore, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SetScore & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, SetScore>;
export declare class Match {
    tournamentId: string;
    stage: string;
    groupName?: string;
    roundNumber: number;
    matchOrder: number;
    roundName?: string;
    team1Id: string | null;
    team2Id: string | null;
    winnerId: string | null;
    court?: string;
    scheduledTime?: string;
    setScores: SetScore[];
    status: MatchStatus;
    nextMatchId: string | null;
    nextMatchSlot: number | null;
}
export declare const MatchSchema: import("mongoose").Schema<Match, import("mongoose").Model<Match, any, any, any, any, any, Match>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Match, Document<unknown, {}, Match, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Match & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    tournamentId?: import("mongoose").SchemaDefinitionProperty<string, Match, Document<unknown, {}, Match, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Match & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    stage?: import("mongoose").SchemaDefinitionProperty<string, Match, Document<unknown, {}, Match, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Match & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    groupName?: import("mongoose").SchemaDefinitionProperty<string, Match, Document<unknown, {}, Match, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Match & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    roundNumber?: import("mongoose").SchemaDefinitionProperty<number, Match, Document<unknown, {}, Match, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Match & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    matchOrder?: import("mongoose").SchemaDefinitionProperty<number, Match, Document<unknown, {}, Match, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Match & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    roundName?: import("mongoose").SchemaDefinitionProperty<string, Match, Document<unknown, {}, Match, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Match & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    team1Id?: import("mongoose").SchemaDefinitionProperty<string, Match, Document<unknown, {}, Match, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Match & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    team2Id?: import("mongoose").SchemaDefinitionProperty<string, Match, Document<unknown, {}, Match, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Match & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    winnerId?: import("mongoose").SchemaDefinitionProperty<string, Match, Document<unknown, {}, Match, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Match & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    court?: import("mongoose").SchemaDefinitionProperty<string, Match, Document<unknown, {}, Match, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Match & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    scheduledTime?: import("mongoose").SchemaDefinitionProperty<string, Match, Document<unknown, {}, Match, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Match & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    setScores?: import("mongoose").SchemaDefinitionProperty<SetScore[], Match, Document<unknown, {}, Match, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Match & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    status?: import("mongoose").SchemaDefinitionProperty<MatchStatus, Match, Document<unknown, {}, Match, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Match & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    nextMatchId?: import("mongoose").SchemaDefinitionProperty<string, Match, Document<unknown, {}, Match, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Match & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    nextMatchSlot?: import("mongoose").SchemaDefinitionProperty<number, Match, Document<unknown, {}, Match, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Match & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, Match>;
