import { useEffect, useState } from 'react';
import { getRooms, getTables } from '@/lib/supabase';

export interface RestaurantTable {
  id: string;
  room_id: string;
  table_number: number;
  position: number;
  capacity: number;
}

export interface Room {
  id: string;
  name: string;
  sort_order: number;
}

interface TableStatusMap {
  [tableId: string]: {
    occupied: boolean;
    ready: boolean;
    orders: any[];
  };
}

export const useTables = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [tableStatus, setTableStatus] = useState<TableStatusMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRoomsAndTables = async () => {
      try {
        setLoading(true);
        setError(null);

        const roomsData = await getRooms();
        setRooms(roomsData);

        // Load tables for each room
        const allTablesMap: Record<string, RestaurantTable[]> = {};
        const statusMap: TableStatusMap = {};

        for (const room of roomsData) {
          const roomTables = (await getTables(room.id)) as RestaurantTable[];
          allTablesMap[room.id] = roomTables;

          // Initialize status for each table
          roomTables.forEach((table) => {
            statusMap[table.id] = {
              occupied: false,
              ready: false,
              orders: [],
            };
          });
        }

        setTables(Object.values(allTablesMap).flat());
        setTableStatus(statusMap);
      } catch (err: any) {
        setError(err.message || 'Failed to load tables');
      } finally {
        setLoading(false);
      }
    };

    loadRoomsAndTables();
  }, []);

  const updateTableStatus = (tableId: string, occupied: boolean, ready: boolean) => {
    setTableStatus((prev) => ({
      ...prev,
      [tableId]: {
        ...prev[tableId],
        occupied,
        ready,
      },
    }));
  };

  const getTablesForRoom = (roomId: string) => {
    return tables.filter((t) => t.room_id === roomId).sort((a, b) => a.position - b.position);
  };

  return {
    rooms,
    tables,
    tableStatus,
    loading,
    error,
    updateTableStatus,
    getTablesForRoom,
  };
};
