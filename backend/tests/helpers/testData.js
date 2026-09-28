const generateTestUserData = () => {
    const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    return {
        name: "Test User",
        email: `testuser-${uniqueId}@example.com`,
        password: "Test@123456"
    };
};


const generateTestBusinessData = () => {
    const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    return {
        businessName: `Test Business ${uniqueId}`,
        businessType: "Retail",
        phone: "9876543210",
        email: `testbusiness-${uniqueId}@example.com`,
        address: "Ahmedabad, Gujarat"
    };
};


const generateTestContactData = () => {
    const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    return {
        name: `Test Contact ${uniqueId}`,
        contactType: "customer",
        phone: "9876543211",
        email: `contact-${uniqueId}@example.com`,
        address: "Ahmedabad, Gujarat"
    };
};


const generateTestCategoryData = (type = "income") => {
    const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    return {
        name: type === "income"
            ? `Test Income Category ${uniqueId}`
            : `Test Expense Category ${uniqueId}`,
        type
    };
};


const generateTestTransactionData = () => {
    return {
        amount: 1000,
        paymentMethod: "cash",
        description: "Test transaction"
    };
};


module.exports = {
    generateTestUserData,
    generateTestBusinessData,
    generateTestContactData,
    generateTestCategoryData,
    generateTestTransactionData
};