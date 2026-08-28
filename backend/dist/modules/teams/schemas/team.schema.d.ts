import { Document } from 'mongoose';
export type TeamDocument = Team & Document;
export declare class Team {
    tournamentId: string;
    name: string;
    groupName?: string;
    seed?: number;
    avatar: string;
}
export declare const TeamSchema: import("mongoose").Schema<Team, import("mongoose").Model<Team, any, any, any, any, any, Team>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Team, Document<unknown, {}, Team, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Team & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    tournamentId?: import("mongoose").SchemaDefinitionProperty<string, Team, Document<unknown, {}, Team, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Team & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    name?: import("mongoose").SchemaDefinitionProperty<string, Team, Document<unknown, {}, Team, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Team & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    groupName?: import("mongoose").SchemaDefinitionProperty<string, Team, Document<unknown, {}, Team, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Team & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    seed?: import("mongoose").SchemaDefinitionProperty<number, Team, Document<unknown, {}, Team, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Team & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    avatar?: import("mongoose").SchemaDefinitionProperty<string, Team, Document<unknown, {}, Team, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Team & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, Team>;
