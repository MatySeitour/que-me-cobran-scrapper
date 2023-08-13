export default function time() {
    const time = new Date();
    const lastUpdate = `${time.getDate().toString()}/${time.getMonth() + 1
        }/${time.getFullYear()} a las ${time.getHours()}:${String(
            time.getMinutes()
        ).padStart(2, "0")}:${String(time.getSeconds()).padStart(2, "0")}`;
    return lastUpdate;
}
