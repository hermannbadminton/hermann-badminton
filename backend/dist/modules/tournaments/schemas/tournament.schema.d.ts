import { Document } from 'mongoose';
import { TournamentStatus } from '../../../common/enums/tournament-status.enum';
export type TournamentDocument = Tournament & Document;
export declare class Tournament {
    name: string;
    category: string;
    format: string;
    groupCount: number;
    advancingPerGroup: number;
    startDate: string;
    endDate: string;
    location: string;
    prizePool: string;
    rulesDescription: string;
    maxSets: number;
    pointsToWinSet: number;
    maxPointsCap: number;
    banner: string;
    status: TournamentStatus;
}
export declare const TournamentSchema: import("mongoose").Schema<Tournament, import("mongoose").Model<Tournament, any, any, any, any, any, Tournament>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Tournament, Document<unknown, {}, Tournament, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Tournament & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Tournament, Document<unknown, {}, Tournament, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Tournament & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    category?: import("mongoose").SchemaDefinitionProperty<string, Tournament, Document<unknown, {}, Tournament, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Tournament & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    format?: import("mongoose").SchemaDefinitionProperty<string, Tournament, Document<unknown, {}, Tournament, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Tournament & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    groupCount?: import("mongoose").SchemaDefinitionProperty<number, Tournament, Document<unknown, {}, Tournament, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Tournament & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    advancingPerGroup?: import("mongoose").SchemaDefinitionProperty<number, Tournament, Document<unknown, {}, Tournament, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Tournament & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    startDate?: import("mongoose").SchemaDefinitionProperty<string, Tournament, Document<unknown, {}, Tournament, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Tournament & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    endDate?: import("mongoose").SchemaDefinitionProperty<string, Tournament, Document<unknown, {}, Tournament, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Tournament & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    location?: import("mongoose").SchemaDefinitionProperty<string, Tournament, Document<unknown, {}, Tournament, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Tournament & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    prizePool?: import("mongoose").SchemaDefinitionProperty<string, Tournament, Document<unknown, {}, Tournament, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Tournament & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    rulesDescription?: import("mongoose").SchemaDefinitionProperty<string, Tournament, Document<unknown, {}, Tournament, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Tournament & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    maxSets?: import("mongoose").SchemaDefinitionProperty<number, Tournament, Document<unknown, {}, Tournament, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Tournament & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    pointsToWinSet?: import("mongoose").SchemaDefinitionProperty<number, Tournament, Document<unknown, {}, Tournament, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Tournament & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    maxPointsCap?: import("mongoose").SchemaDefinitionProperty<number, Tournament, Document<unknown, {}, Tournament, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Tournament & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    banner?: import("mongoose").SchemaDefinitionProperty<string, Tournament, Document<unknown, {}, Tournament, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Tournament & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    status?: import("mongoose").SchemaDefinitionProperty<TournamentStatus, Tournament, Document<unknown, {}, Tournament, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Tournament & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, Tournament>;
