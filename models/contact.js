import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";
import User from "./user.js";

const Contact = sequelize.define("contact", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    favorite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    owner: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

Contact.belongsTo(User, { foreignKey: "owner" });
await Contact.sync();

export default Contact;
