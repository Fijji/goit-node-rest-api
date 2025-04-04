import contactsServices from "../services/contactsServices.js";
import HttpError from "../helpers/HttpError.js";

export const getAllContacts = async (req, res, next) => {
    try {
        const contacts = await contactsServices.listContacts();
        res.status(200).json(contacts);
    } catch (error) {
        next(error);
    }
};

export const getOneContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const contact = await contactsServices.getContactById(id);
        if (!contact) {
            return next(HttpError(404));
        }
        res.status(200).json(contact);
    } catch (error) {
        next(error);
    }
};

export const deleteContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedContact = await contactsServices.removeContact(id);
        if (!deletedContact) {
            return next(HttpError(404));
        }
        res.status(200).json(deletedContact);
    } catch (error) {
        next(error);
    }
};

export const createContact = async (req, res, next) => {
    try {
        const { name, email, phone } = req.body;
        const newContact = await contactsServices.addContact(name, email, phone);
        res.status(201).json(newContact);
    } catch (error) {
        next(error);
    }
};

export const putUpdateContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!Object.keys(updates).length) {
            return next(HttpError(400, "Body must have at least one field"));
        }

        const updatedContact = await contactsServices.updateContact(id, updates);
        if (!updatedContact) {
            return next(HttpError(404));
        }
        res.status(200).json(updatedContact);
    } catch (error) {
        next(error);
    }
};

export const patchUpdateFavorite = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { favorite } = req.body;
        if (typeof favorite !== "boolean") {
            return next(HttpError(400, "Missing field favorite"));
        }

        const updatedContact = await contactsServices.updateStatusContact(id, { favorite });
        if (!updatedContact) {
            return next(HttpError(404));
        }
        res.status(200).json(updatedContact);
    } catch (error) {
        next(error);
    }
};
