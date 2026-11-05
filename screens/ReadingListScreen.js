import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { ReadingListContext } from '../context/ReadingListContext';
import { getBookById } from '../data/books';

export default function ReadingListScreen() {
  const { readingList, updateStatus, removeFromList } = useContext(ReadingListContext);

  const readingListData = Object.keys(readingList).map(id => ({
    book: getBookById(id),
    status: readingList[id]
  })).filter(item => item.book);

  if (readingListData.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Your reading list is empty.</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const { book, status } = item;
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>{book.author}</Text>
        
        <Text style={styles.statusLabel}>Status: <Text style={styles.statusValue}>{status}</Text></Text>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.button, status === 'Not Read' && styles.activeButton]}
            onPress={() => updateStatus(book.id, 'Not Read')}
          >
            <Text style={[styles.buttonText, status === 'Not Read' && styles.activeButtonText]}>Not Read</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, status === 'Half Done' && styles.activeButton]}
            onPress={() => updateStatus(book.id, 'Half Done')}
          >
            <Text style={[styles.buttonText, status === 'Half Done' && styles.activeButtonText]}>Half Done</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, status === 'Read' && styles.activeButton]}
            onPress={() => updateStatus(book.id, 'Read')}
          >
            <Text style={[styles.buttonText, status === 'Read' && styles.activeButtonText]}>Read</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => removeFromList(book.id)} style={styles.removeButton}>
          <Text style={styles.removeText}>Remove from list</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={readingListData}
        keyExtractor={item => item.book.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  author: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  statusValue: {
    fontWeight: 'bold',
    color: '#007BFF',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 5,
  },
  activeButton: {
    backgroundColor: '#007BFF',
  },
  buttonText: {
    color: '#007BFF',
    fontSize: 12,
  },
  activeButtonText: {
    color: '#fff',
  },
  removeButton: {
    alignItems: 'center',
  },
  removeText: {
    color: 'red',
    fontSize: 14,
  }
});
