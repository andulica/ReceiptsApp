const Notification = ({ message, type }) => {
    if (!message) return null;

    const styles = {
        info: { color: "blue" },
        success: { color: "green" },
        error: { color: "red" },
    };

    return (
        <div style={{ marginBottom: "20px", ...styles[type] }}>
            {message}
        </div>
    );
};

export default Notification;