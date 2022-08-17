import { useMemo } from "react";
import { selectCurrentUser } from "./hooks";
import { useSelector } from "react-redux";
import { useAppSelector } from "./hooks";

export const useAuth = () => {
    const user  = useAppSelector(selectCurrentUser)

    return useMemo(() => ({ user}), [user])
}