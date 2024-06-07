"use client";

import { toast } from "sonner";
import { graphql } from "gql.tada";
import { getClient } from "@/lib/gql";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import { NoteCard } from "./card";
import { NoteQueryResult } from "../queries";
import { Skeleton } from "@umamin/ui/components/skeleton";

const NOTES_FROM_CURSOR_MUTATION = graphql(`
  mutation NotesFromCursor($cursor: NotesFromCursorInput!) {
    notesFromCursor(cursor: $cursor) {
      __typename
      data {
        __typename
        id
        userId
        content
        updatedAt
        isAnonymous
        user {
          __typename
          id
          username
          imageUrl
        }
      }
      hasMore
      cursor {
        __typename
        id
        updatedAt
      }
    }
  }
`);

type Props = {
  currentUserId?: string;
  notes: NoteQueryResult[];
};

export function NotesList({ currentUserId, notes }: Props) {
  const { ref, inView } = useInView();

  const [cursor, setCursor] = useState({
    id: notes[notes.length - 1]?.id ?? null,
    updatedAt: notes[notes.length - 1]?.updatedAt ?? null,
  });

  const [notesList, setNotesList] = useState(notes);
  const [hasMore, setHasMore] = useState(notes?.length === 10);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (hasMore) {
      setIsFetching(true);

      getClient()
        .mutation(NOTES_FROM_CURSOR_MUTATION, {
          cursor,
        })
        .then((res) => {
          if (res.error) {
            toast.error(res.error.message);
            setIsFetching(false);
            return;
          }

          const _res = res.data?.notesFromCursor;

          if (_res?.cursor) {
            setCursor({
              id: _res.cursor.id,
              updatedAt: _res.cursor.updatedAt,
            });

            setHasMore(_res.hasMore);
          }

          if (_res?.data) {
            setNotesList([...notesList, ..._res.data]);
          }

          setIsFetching(false);
        });
    }
  }, [hasMore, inView, notesList]);

  return (
    <>
      {notesList
        ?.filter((u) => u.userId !== currentUserId)
        .map((note) => <NoteCard key={note.id} note={note} />)}

      {isFetching && <Skeleton className="w-full h-[200px] rounded-lg" />}
      {hasMore && <div ref={ref}></div>}
    </>
  );
}
