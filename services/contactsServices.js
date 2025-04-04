import Contact from "../models/contact.js";

async function listContacts() {
    return await Contact.findAll();
}

async function getContactById(contactId) {
    return await Contact.findByPk(contactId);
}

async function removeContact(contactId) {
    const contact = await getContactById(contactId);
    if (!contact) return null;

    await contact.destroy();
    return contact;
}

async function addContact(name, email, phone) {
    return await Contact.create({name, email, phone});
}

async function updateContact(contactId, updates) {
    const contact = await getContactById(contactId);
    if (!contact) return null;

    await contact.update(updates);
    return contact;
}

async function updateStatusContact(contactId, { favorite }) {
    const contact = await Contact.findByPk(contactId);
    if (!contact) return null;

    contact.favorite = favorite;
    await contact.save();
    return contact;
}

const contactsServices = {
    listContacts,
    getContactById,
    removeContact,
    addContact,
    updateContact,
    updateStatusContact
};

export default contactsServices;